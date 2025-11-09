const { check } = require('express-validator');
const { validateFields } = require('./validate-fields');

const loginValidation = [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password es obligatorio').not().isEmpty(),
    validateFields
];

module.exports = {
    loginValidation
};
