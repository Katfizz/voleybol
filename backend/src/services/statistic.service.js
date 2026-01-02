const prisma = require('../db/prisma');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Registra o actualiza estadísticas para un partido específico.
 * Recibe un array de estadísticas por jugador.
 */
const recordMatchStatistics = async (matchId, statsList, userId) => {
    const mId = parseInt(matchId, 10);
    const userIdInt = userId ? parseInt(userId, 10) : null;

    // Verificar existencia del partido
    const match = await prisma.match.findUnique({ where: { id: mId } });
    if (!match) {
        throw new NotFoundError(`Partido con ID ${mId} no encontrado.`);
    }

    // Validar que los jugadores existan (opcional, pero buena práctica)
    const playerIds = statsList.map(s => parseInt(s.player_profile_id, 10));
    const count = await prisma.playerProfile.count({
        where: { id: { in: playerIds } }
    });
    if (count !== playerIds.length) {
        throw new BadRequestError('Uno o más IDs de perfil de jugador no son válidos.');
    }

    return prisma.$transaction(async (tx) => {
        const results = [];
        for (const stat of statsList) {
            const { player_profile_id, points, kills, errors, aces, blocks, assists, digs } = stat;
            const pId = parseInt(player_profile_id, 10);

            // Upsert: Crea si no existe, actualiza si ya existe
            const entry = await tx.statistic.upsert({
                where: {
                    player_profile_id_match_id: {
                        player_profile_id: pId,
                        match_id: mId
                    }
                },
                update: { points, kills, errors, aces, blocks, assists, digs, last_updated_by_id: userIdInt },
                create: {
                    match_id: mId,
                    player_profile_id: pId,
                    points, kills, errors, aces, blocks, assists, digs, last_updated_by_id: userIdInt
                }
            });
            results.push(entry);
        }
        return results;
    });
};

/**
 * Obtiene el historial de estadísticas de un jugador (partido por partido).
 */
const getPlayerStatistics = async (playerProfileId) => {
    const pId = parseInt(playerProfileId, 10);
    
    const profile = await prisma.playerProfile.findUnique({ where: { id: pId } });
    if (!profile) throw new NotFoundError('Perfil de jugador no encontrado.');

    return prisma.statistic.findMany({
        where: { player_profile_id: pId },
        include: {
            match: {
                include: {
                    event: { select: { name: true, date_time: true } },
                    homeCategory: { select: { name: true } },
                    awayCategory: { select: { name: true } }
                }
            }
        },
        orderBy: { match: { event: { date_time: 'desc' } } }
    });
};

/**
 * Obtiene un resumen acumulado (totales y promedios) del rendimiento del jugador.
 */
const getPlayerSummary = async (playerProfileId) => {
    const pId = parseInt(playerProfileId, 10);

    const aggregations = await prisma.statistic.aggregate({
        where: { player_profile_id: pId },
        _sum: {
            points: true, kills: true, errors: true, aces: true, blocks: true, assists: true, digs: true
        },
        _avg: {
            points: true, kills: true, errors: true, aces: true, blocks: true, assists: true, digs: true
        },
        _count: {
            match_id: true
        }
    });

    return {
        matches_played: aggregations._count.match_id,
        totals: aggregations._sum,
        averages: aggregations._avg
    };
};

/**
 * Obtiene las estadísticas de un partido específico (todos los jugadores).
 */
const getMatchStatistics = async (matchId) => {
    const mId = parseInt(matchId, 10);
    return prisma.statistic.findMany({
        where: { match_id: mId },
        include: {
            player_profile: { select: { full_name: true, position: true } },
            last_updated_by: { select: { email: true } }
        }
    });
};

/**
 * Actualiza una estadística específica por su ID.
 */
const updateStatistic = async (id, data, userId) => {
    const statId = parseInt(id, 10);
    const userIdInt = userId ? parseInt(userId, 10) : null;
    
    const existingStat = await prisma.statistic.findUnique({ where: { id: statId } });
    if (!existingStat) {
        throw new NotFoundError(`Estadística con ID ${statId} no encontrada.`);
    }

    return prisma.statistic.update({
        where: { id: statId },
        data: {
            ...data,
            last_updated_by_id: userIdInt
        }
    });
};

/**
 * Elimina una estadística específica por su ID.
 */
const deleteStatistic = async (id) => {
    const statId = parseInt(id, 10);
    
    const existingStat = await prisma.statistic.findUnique({ where: { id: statId } });
    if (!existingStat) {
        throw new NotFoundError(`Estadística con ID ${statId} no encontrada.`);
    }

    return prisma.statistic.delete({ where: { id: statId } });
};

module.exports = {
    recordMatchStatistics,
    getPlayerStatistics,
    getPlayerSummary,
    getMatchStatistics,
    updateStatistic,
    deleteStatistic
};