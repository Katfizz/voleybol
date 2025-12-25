const statisticService = require('../services/statistic.service');

const recordStats = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const { stats } = req.body; // Array de stats
        const results = await statisticService.recordMatchStatistics(matchId, stats);
        res.status(200).json({ ok: true, msg: 'Estadísticas registradas.', results });
    } catch (error) {
        next(error);
    }
};

const getPlayerStats = async (req, res, next) => {
    try {
        const { playerProfileId } = req.params;
        // Obtenemos historial y resumen en paralelo
        const [history, summary] = await Promise.all([
            statisticService.getPlayerStatistics(playerProfileId),
            statisticService.getPlayerSummary(playerProfileId)
        ]);
        
        res.status(200).json({ ok: true, history, summary });
    } catch (error) {
        next(error);
    }
};

const getMatchStats = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const stats = await statisticService.getMatchStatistics(matchId);
        res.status(200).json({ ok: true, stats });
    } catch (error) {
        next(error);
    }
};

module.exports = { recordStats, getPlayerStats, getMatchStats };