const { check } = require('express-validator');
const { validateFields } = require('./validate-fields');
const { EventType } = require('@prisma/client');

const eventCreationValidation = [
    check('name', 'El nombre del evento es obligatorio').not().isEmpty(),
    check('type', 'El tipo de evento no es válido').isIn(Object.values(EventType)),
    check('date_time', 'La fecha del evento es obligatoria y debe ser una fecha válida').isISO8601().toDate(),
    check('location', 'La ubicación del evento es obligatoria').not().isEmpty(),
    check('description', 'La descripción debe ser un texto').optional().isString(),
    check('categoryIds')
        .isArray({ min: 1 }).withMessage('Se debe asignar al menos una categoría (equipo) al evento.')
        .custom((value, { req }) => {
            if ((req.body.type === EventType.MATCH || req.body.type === EventType.TOURNAMENT) && value.length < 2) {
                throw new Error('Un evento de tipo partido o torneo requiere al menos 2 equipos.');
            }
            return true;
        }),
    check('categoryIds.*', 'Cada ID de categoría debe ser un número entero.').isInt(),

    // Validaciones para los detalles de la práctica si el tipo es PRACTICE
    check('practice', 'Los detalles de la práctica deben ser un objeto').if((value, { req }) => req.body.type === EventType.PRACTICE).optional().isObject(),
    check('practice.objective', 'El objetivo de la práctica debe ser un texto').if((value, { req }) => req.body.type === EventType.PRACTICE).optional().isString(),

    validateFields
];

const eventUpdateValidation = [
    check('name', 'El nombre del evento debe ser un texto').optional().not().isEmpty(),
    check('date_time', 'La fecha del evento debe ser una fecha válida').optional().isISO8601().toDate(),
    check('location', 'La ubicación del evento debe ser un texto').optional().not().isEmpty(),
    check('description', 'La descripción debe ser un texto').optional().isString(),
    validateFields
];

module.exports = {
    eventCreationValidation,
    eventUpdateValidation,
};