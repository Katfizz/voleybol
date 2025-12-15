const { check } = require('express-validator');
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
    validateFields
];

module.exports = {
    matchCreationValidation,
};