const { check } = require('express-validator');
const { validateFields } = require('./validate-fields');
const { Role } = require('@prisma/client');

const userCreationValidation = [
    check('email', 'El email no es válido').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
    check('role', 'El rol no es válido').isIn([Role.ADMIN, Role.COACH, Role.PLAYER]),
    check('profile').custom((value, { req }) => {
        if (req.body.role === Role.PLAYER) {
            if (!value) {
                throw new Error('El objeto de perfil (profile) es obligatorio para los jugadores.');
            }
            if (!value.full_name) {
                throw new Error('El nombre completo (full_name) es obligatorio para los jugadores.');
            }
            if (!value.contact_data) {
                throw new Error('Los datos de contacto (contact_data) son obligatorios para los jugadores.');
            }

            // La fecha de nacimiento es necesaria para validar la edad.
            if (!value.birthDate) {
                throw new Error('La fecha de nacimiento (birthDate) es obligatoria para los jugadores.');
            }

            // Lógica para validar la edad y requerir datos del representante si es menor de 18.
            const birthDateObj = new Date(value.birthDate);
            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const monthDifference = today.getMonth() - birthDateObj.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }

            if (age < 18 && !value.representative_data) {
                throw new Error('Los datos del representante (representative_data) son obligatorios para jugadores menores de 18 años.');
            }

        }
        return true;
    }),
    // Validaciones para los campos dentro del perfil del jugador
    check('profile.birthDate', 'La fecha de nacimiento debe ser una fecha válida').optional().isISO8601().toDate(),
    check('profile.contact_data', 'La información de contacto debe ser un objeto').if((value, { req }) => req.body.role === Role.PLAYER).isObject(),
    check('profile.representative_data', 'Los datos del representante deben ser un objeto').optional().isObject(),
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