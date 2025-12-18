const express = require('express');
const matchController = require('../controllers/match.controller');
const { validateRecordResults, validateMatchId } = require('../middlewares/match.validators');
const { validateJWT, hasRole } = require('../middlewares');
const { Role } = require('@prisma/client');

const router = express.Router();

// Todas las rutas de partidos requieren autenticación
router.use(validateJWT);

// --- Rutas de lectura (GET) para cualquier usuario autenticado ---
router.get('/', matchController.getAllMatches);
router.get('/:id', validateMatchId, matchController.getMatchById);

// --- Rutas de escritura (PUT, DELETE) solo para ADMIN o COACH ---

router.put(
    '/:id/results',
    hasRole(Role.ADMIN, Role.COACH),
    validateMatchId,
    validateRecordResults,
    matchController.recordResults
);

router.delete(
    '/:id',
    hasRole(Role.ADMIN, Role.COACH),
    validateMatchId,
    matchController.deleteMatch
);

module.exports = router;