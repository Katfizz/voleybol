const matchService = require('../services/match.service');

/**
 * Controlador para registrar los resultados de un partido.
 */
const recordResults = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { sets } = req.body;

        const updatedMatch = await matchService.recordMatchResults(id, sets);

        res.status(200).json({ ok: true, match: updatedMatch });
    } catch (error) {
        next(error);
    }
};

/**
 * Controlador para obtener todos los partidos.
 */
const getAllMatches = async (req, res, next) => {
    try {
        const matches = await matchService.getAllMatches();
        res.status(200).json({ ok: true, matches });
    } catch (error) {
        next(error);
    }
};

/**
 * Controlador para obtener un partido por su ID.
 */
const getMatchById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const match = await matchService.getMatchById(id);
        res.status(200).json({ ok: true, match });
    } catch (error) {
        next(error);
    }
};

/**
 * Controlador para eliminar un partido.
 */
const deleteMatch = async (req, res, next) => {
    try {
        const { id } = req.params;
        await matchService.deleteMatch(id);

        res.status(200).json({ ok: true, msg: 'Partido eliminado exitosamente.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    recordResults,
    getAllMatches,
    getMatchById,
    deleteMatch,
};