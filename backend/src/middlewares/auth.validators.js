const { check } = require('express-validator');
const { validateFields } = require('./validate-fields');
const { validateJWT } = require('./validate-jwt');
const { canCreateUser } = require('./validate-role');

const registerValidation = [
    validateJWT,
    canCreateUser,
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
    check('role', 'El rol es obligatorio y debe ser COACH o PLAYER').isIn(['COACH', 'PLAYER']),
    validateFields
];

const loginValidation = [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password es obligatorio').not().isEmpty(),
    validateFields
];

module.exports = {
    registerValidation,
    loginValidation
};
