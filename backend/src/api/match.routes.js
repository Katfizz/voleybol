const express = require('express');
const matchController = require('../controllers/match.controller');
const { validateRecordResults, validateMatchId } = require('../middlewares/match.validators');
const { validateJWT, hasRole } = require('../middlewares');
const { Role } = require('@prisma/client');

const router = express.Router();

// Todas las rutas de partidos requieren autenticación
router.use(validateJWT);

// Todas las rutas de este archivo requieren rol de ADMIN o COACH
router.use(hasRole(Role.ADMIN, Role.COACH));

router.put(
    '/:id/results',
    validateMatchId,
    validateRecordResults,
    matchController.recordResults
);

router.delete(
    '/:id',
    validateMatchId,
    matchController.deleteMatch
);

module.exports = router;