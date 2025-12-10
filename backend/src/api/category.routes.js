const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields, validateJWT, hasRole } = require('../middlewares');
const {
    createCategoryController,
    assignPlayerController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController,
    assignCoachController, // Importar el nuevo controlador
    removePlayerFromCategoryController,
    removeCoachFromCategoryController,
} = require('../controllers/category.controller');
const { Role } = require('@prisma/client');

const router = Router();

// Middleware para todas las rutas de este archivo
router.use(validateJWT);

// GET todas las categorías
router.get('/', getAllCategoriesController);

// GET una categoría por ID
router.get('/:id', [
    check('id', 'El ID debe ser un número entero').isInt(), validateFields
], getCategoryByIdController);

// Crear una nueva categoría (ADMIN, COACH)
router.post(
    '/',
    [
        check('name', 'El nombre de la categoría es obligatorio').not().isEmpty().isString(),
        validateFields,
    ],
    createCategoryController
);

// Asignar un jugador a una categoría (ADMIN, COACH)
router.post(
    '/:id/players', // Usamos POST para añadir una nueva relación
    [
        check('id', 'El ID de la categoría debe ser un número').isInt(),
        validateFields,
    ],
    assignPlayerController
);

// Asignar un coach a una categoría (ADMIN puede asignar a cualquiera, COACH solo a sí mismo)
router.post(
    '/:id/coaches',
    [
        hasRole(Role.ADMIN, Role.COACH), // Solo ADMIN y COACH pueden acceder
        check('id', 'El ID de la categoría debe ser un número').isInt(),
        check('coachId', 'El ID del coach es obligatorio y debe ser un número').not().isEmpty().isInt(),
        validateFields,
    ],
    assignCoachController
);

// PUT actualizar una categoría (Solo ADMIN para evitar inconsistencias)
router.put('/:id', [
    hasRole(Role.ADMIN, Role.COACH),
    check('id', 'El ID debe ser un número entero').isInt(),
    check('name', 'El nombre debe ser un texto').optional().isString(),
    validateFields,
], updateCategoryController);

// DELETE una categoría (Solo ADMIN)
router.delete('/:id', [
    hasRole(Role.ADMIN, Role.COACH),
    check('id', 'El ID debe ser un número entero').isInt(),
    validateFields,
], deleteCategoryController);

// Desasignar un jugador de una categoría (ADMIN, COACH)
router.delete(
    '/:id/players/:playerId',
    [
        hasRole(Role.ADMIN, Role.COACH),
        check('id', 'El ID de la categoría debe ser un número').isInt(),
        check('playerId', 'El ID del jugador debe ser un número').isInt(),
        validateFields,
    ],
    removePlayerFromCategoryController
);

// Desasignar un coach de una categoría (ADMIN, COACH)
router.delete(
    '/:id/coaches/:coachId',
    [
        hasRole(Role.ADMIN, Role.COACH),
        check('id', 'El ID de la categoría debe ser un número').isInt(),
        check('coachId', 'El ID del coach debe ser un número').isInt(),
        validateFields,
    ],
    removeCoachFromCategoryController
);

module.exports = router;