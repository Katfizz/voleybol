const { Router } = require('express');
const { validateJWT, hasRole, validateRecordStats, validateStatId, validateUpdateStats } = require('../middlewares');
const { recordStats, getPlayerStats, getMatchStats, updateStats, deleteStats } = require('../controllers/statistic.controller');

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

// Actualizar una estadística específica (ADMIN, COACH)
router.patch('/:id', [
    validateJWT,
    hasRole('ADMIN', 'COACH'),
    validateUpdateStats
], updateStats);

// Eliminar una estadística específica (ADMIN, COACH)
router.delete('/:id', [
    validateJWT,
    hasRole('ADMIN', 'COACH'),
    validateStatId
], deleteStats);

module.exports = router;