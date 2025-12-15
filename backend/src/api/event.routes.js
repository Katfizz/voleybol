const { Router } = require('express');
const {
    createEventController,
    getAllEventsController,
    getEventByIdController,
    updateEventController,
    deleteEventController,
    createMatchController
} = require('../controllers/event.controller');
const { eventCreationValidation, eventUpdateValidation } = require('../middlewares/event.validators');
const { matchCreationValidation } = require('../middlewares/match.validators');
const { validateJWT, hasRole } = require('../middlewares');
const { Role } = require('@prisma/client');

const router = Router();

// Todas las rutas de eventos requieren autenticación
router.use(validateJWT);

// Obtener todos los eventos (abierto a todos los usuarios autenticados)
router.get('/', getAllEventsController);

// Obtener un evento por ID (abierto a todos los usuarios autenticados)
router.get('/:id', getEventByIdController);

// Las siguientes rutas solo son para ADMIN y COACH
router.use(hasRole(Role.ADMIN, Role.COACH));

router.post('/', eventCreationValidation, createEventController);

router.post('/:id/matches', matchCreationValidation, createMatchController);

router.put('/:id', eventUpdateValidation, updateEventController);
router.delete('/:id', deleteEventController);

module.exports = router;
