const { check } = require('express-validator');
const { validateFields } = require('./validate-fields');
const { Role } = require('@prisma/client');

const userCreationValidation = [
    check('email', 'El email no es válido').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
    check('role', 'El rol no es válido').isIn([Role.ADMIN, Role.COACH, Role.PLAYER]),
    check('profile').custom((value, { req }) => {
        if (req.body.role === Role.PLAYER) {
            if (!value || !value.firstName || !value.lastName) {
                throw new Error('El perfil con nombre (firstName) y apellido (lastName) es obligatorio para los jugadores');
            }
        }
        return true;
    }),
    // Validaciones para los campos dentro del perfil del jugador
    check('profile.birthDate', 'La fecha de nacimiento debe ser una fecha válida').optional().isISO8601().toDate(),
    check('profile.contact', 'La información de contacto debe ser un objeto').optional().isObject(),
    check('profile.representativeData', 'Los datos del representante deben ser un objeto').optional().isObject(),
    validateFields
];

const userUpdateValidation = [
    check('email', 'El email no es válido').optional().isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').optional().isLength({ min: 6 }),
    check('role', 'El rol no es válido').optional().isIn([Role.ADMIN, Role.COACH, Role.PLAYER]),
    // Validaciones para los campos del perfil al actualizar
    check('full_name', 'El nombre completo es obligatorio para los jugadores').optional().isString(),
    check('birth_date', 'La fecha de nacimiento debe ser una fecha válida').optional().isISO8601().toDate(),
    check('contact_info', 'La información de contacto debe ser un objeto').optional().isObject(),
    check('position', 'La posición debe ser una cadena de texto').optional().isString(),
    validateFields
];

module.exports = {
    userCreationValidation,
    userUpdateValidation
};