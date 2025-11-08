const { Router } = require('express');
const { check } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.post(
    '/register',
    [
        validateJWT, // Proteger la ruta, el usuario debe estar autenticado
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
        check('role', 'El rol es obligatorio').isIn(['ADMIN', 'COACH', 'PLAYER']),
        validateFields
    ],
    register
);

router.post(
    '/login',
    [
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password es obligatorio').not().isEmpty(),
        validateFields
    ],
    login
);

module.exports = router;