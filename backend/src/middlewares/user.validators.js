const { check } = require('express-validator');
const { validateFields } = require('./validate-fields');
const { Role } = require('@prisma/client');

const userCreationValidation = [
    check('email', 'El email no es válido').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
    check('role', 'El rol no es válido').isIn([Role.ADMIN, Role.COACH, Role.PLAYER]),
    check('full_name').custom((value, { req }) => {
        if (req.body.role === Role.PLAYER && !value) {
            throw new Error('El nombre completo es obligatorio para los jugadores');
        }
        return true;
    }),
    check('birth_date', 'La fecha de nacimiento debe ser una fecha válida').optional().isISO8601().toDate(),
    check('contact_info', 'La información de contacto debe ser una cadena de texto').optional().isString(),
    check('position', 'La posición debe ser una cadena de texto').optional().isString(),
    validateFields
];

const userUpdateValidation = [
    check('email', 'El email no es válido').optional().isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').optional().isLength({ min: 6 }),
    check('role', 'El rol no es válido').optional().isIn([Role.ADMIN, Role.COACH, Role.PLAYER]),
    check('full_name').optional().custom((value, { req }) => {
        if (req.body.role === Role.PLAYER && !value) {
            throw new Error('El nombre completo es obligatorio para los jugadores');
        }
        return true;
    }),
    check('birth_date', 'La fecha de nacimiento debe ser una fecha válida').optional().isISO8601().toDate(),
    check('contact_info', 'La información de contacto debe ser una cadena de texto').optional().isString(),
    check('position', 'La posición debe ser una cadena de texto').optional().isString(),
    validateFields
];

module.exports = {
    userCreationValidation,
    userUpdateValidation
};