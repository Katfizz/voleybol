const prisma = require('../db/prisma');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Registra los resultados de los sets para un partido, calcula el ganador y actualiza el partido.
 * @param {string} matchId - El ID del partido.
 * @param {Array<object>} sets - Un arreglo de objetos, cada uno representando un set.
 * @returns {Promise<object>} El partido actualizado con sus sets y ganador.
 */
const recordMatchResults = async (matchId, sets) => {
    const id = parseInt(matchId, 10);

    // Usamos una transacción para asegurar la integridad de los datos.
    // O todo se completa con éxito, o nada lo hace.
    return prisma.$transaction(async (tx) => {
        // 1. Verificar que el partido exista y obtener los IDs de los equipos.
        const match = await tx.match.findUnique({
            where: { id },
            select: { home_category_id: true, away_category_id: true }
        });

        if (!match) {
            throw new NotFoundError(`El partido con ID ${id} no fue encontrado.`);
        }

        // 2. Borrar los sets antiguos para permitir la corrección de resultados.
        await tx.set.deleteMany({ where: { match_id: id } });

        // 3. Calcular los resultados y preparar los nuevos sets.
        let homeSetsWon = 0;
        let awaySetsWon = 0;

        const setsToCreate = sets.map(set => {
            const { set_number, home_score, away_score } = set;
            let winnerId = null;

            // Lógica simple para determinar el ganador del set.
            if (home_score > away_score) {
                homeSetsWon++;
                winnerId = match.home_category_id;
            } else if (away_score > home_score) {
                awaySetsWon++;
                winnerId = match.away_category_id;
            } else {
                // En caso de empate en un set (poco común, pero posible en formatos especiales)
                // no se asigna ganador para el set.
            }

            return {
                set_number,
                home_score,
                away_score,
                match_id: id,
                winner_category_id: winnerId,
            };
        });

        /*
         * --- VALIDACIÓN DE PARTIDO FINALIZADO (COMENTADA) ---
         * Esta sección puede ser descomentada para forzar que solo se registren
         * resultados de partidos completos (ej. al mejor de 5 sets).
         * const isMatchFinished = Math.max(homeSetsWon, awaySetsWon) === 3;
         * if (!isMatchFinished) {
         *     throw new BadRequestError(`El resultado ${homeSetsWon}-${awaySetsWon} no es un resultado final válido. Un equipo debe ganar 3 sets.`);
         * }
         */

        // 4. Crear todos los nuevos sets en la base de datos.
        await tx.set.createMany({ data: setsToCreate });

        // 5. Determinar el ganador final del partido.
        const matchWinnerId = homeSetsWon > awaySetsWon ? match.home_category_id : match.away_category_id;

        // 6. Actualizar el partido con los resultados finales.
        const updatedMatch = await tx.match.update({
            where: { id },
            data: {
                home_sets_won: homeSetsWon,
                away_sets_won: awaySetsWon,
                winner_category_id: matchWinnerId,
            },
            include: { sets: true, winnerCategory: { select: { name: true } } } // Devolver info útil
        });

        return updatedMatch;
    });
};

/**
 * Obtiene una lista de todos los partidos.
 * @returns {Promise<Array<object>>} Un arreglo de partidos.
 */
const getAllMatches = async () => {
    const matches = await prisma.match.findMany({
        include: {
            event: { select: { name: true } },
            homeCategory: { select: { name: true } },
            awayCategory: { select: { name: true } },
            winnerCategory: { select: { name: true } },
        },
        orderBy: {
            id: 'desc' // Muestra los partidos más recientes primero
        }
    });
    return matches;
};

/**
 * Obtiene un partido específico por su ID.
 * @param {string} matchId - El ID del partido.
 * @returns {Promise<object>} El objeto del partido con sus datos relacionados.
 */
const getMatchById = async (matchId) => {
    const id = parseInt(matchId, 10);

    const match = await prisma.match.findUnique({
        where: { id },
        include: {
            event: { select: { name: true } },
            homeCategory: { select: { name: true } },
            awayCategory: { select: { name: true } },
            winnerCategory: { select: { name: true } },
            sets: {
                orderBy: {
                    set_number: 'asc' // Asegura que los sets vengan ordenados
                }
            }
        }
    });

    if (!match) {
        throw new NotFoundError(`No se encontró un partido con el ID ${id}.`);
    }

    return match;
};

/**
 * Elimina un partido por su ID.
 * @param {string} matchId - El ID del partido a eliminar.
 * @returns {Promise<object>} El partido que fue eliminado.
 */
const deleteMatch = async (matchId) => {
    const id = parseInt(matchId, 10);

    // 1. Verificar que el partido exista antes de intentar borrarlo.
    const match = await prisma.match.findUnique({
        where: { id },
    });

    if (!match) {
        throw new NotFoundError(`No se encontró un partido con el ID ${id}.`);
    }

    // 2. Si existe, proceder con la eliminación.
    return prisma.match.delete({ where: { id } });
};

module.exports = {
    recordMatchResults,
    getAllMatches,
    getMatchById,
    deleteMatch,
};