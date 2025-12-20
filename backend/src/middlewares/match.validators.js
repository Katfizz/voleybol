const { check, body, param } = require('express-validator');
const { validateFields } = require('./validate-fields');

const matchCreationValidation = [
    check('home_category_id', 'El ID de la categoría local es obligatorio y debe ser un número').isInt(),
    check('away_category_id', 'El ID de la categoría visitante es obligatorio y debe ser un número').isInt()
        .custom((value, { req }) => {
            if (value === req.body.home_category_id) {
                throw new Error('La categoría visitante no puede ser la misma que la categoría local.');
            }
            return true;
        }),
    validateFields,
];

const validateRecordResults = [
    body('sets')
        .isArray({ min: 1 }).withMessage('El campo "sets" debe ser un arreglo con al menos un elemento.'),

    body('sets.*.set_number')
        .isInt({ gt: 0 }).withMessage('El "set_number" debe ser un número entero positivo.'),

    body('sets.*.home_score')
        .isInt({ min: 0 }).withMessage('El "home_score" debe ser un número entero no negativo.'),

    body('sets.*.away_score')
        .isInt({ min: 0 }).withMessage('El "away_score" debe ser un número entero no negativo.'),

    validateFields,
];

const validateMatchId = [
    param('id').isInt().withMessage('El ID del partido debe ser un número entero.'),
    validateFields,
];

module.exports = {
    matchCreationValidation,
    validateRecordResults,
    validateMatchId,
};