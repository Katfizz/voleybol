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
                winner_id: winnerId,
            };
        });

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
                winner_id: matchWinnerId,
            },
            include: { sets: true, winner: { select: { name: true } } } // Devolver info útil
        });

        return updatedMatch;
    });
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
    deleteMatch,
};