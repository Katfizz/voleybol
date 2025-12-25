const { Router } = require('express');
const { validateJWT, hasRole, validateRecordStats } = require('../middlewares');
const { recordStats, getPlayerStats, getMatchStats } = require('../controllers/statistic.controller');

const router = Router();

// Registrar estadísticas (ADMIN, COACH)
router.post('/match/:matchId', [
    validateJWT,
    hasRole('ADMIN', 'COACH'),
    validateRecordStats
], recordStats);

// Ver estadísticas de un partido (Cualquier usuario autenticado)
router.get('/match/:matchId', validateJWT, getMatchStats);

// Ver estadísticas de un jugador (Cualquier usuario autenticado)
router.get('/player/:playerProfileId', validateJWT, getPlayerStats);

module.exports = router;