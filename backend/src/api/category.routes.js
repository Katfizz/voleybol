const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields, validateJWT } = require('../middlewares');
const { createCategoryController, assignPlayerController } = require('../controllers/category.controller');

const router = Router();

// Middleware para todas las rutas de este archivo
router.use(validateJWT);

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

module.exports = router;