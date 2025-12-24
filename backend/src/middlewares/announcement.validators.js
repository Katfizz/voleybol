const { body, param } = require('express-validator');
const { validateFields } = require('./validate-fields');

const validateCreateAnnouncement = [
    body('title')
        .notEmpty().withMessage('El título es obligatorio.')
        .isString(),
    body('content')
        .notEmpty().withMessage('El contenido es obligatorio.')
        .isString(),
    body('valid_from')
        .optional()
        .isISO8601().withMessage('La fecha de inicio debe ser válida (YYYY-MM-DD).'),
    body('valid_until')
        .optional()
        .isISO8601().withMessage('La fecha de fin debe ser válida (YYYY-MM-DD).'),
    validateFields
];

const validateAnnouncementId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del anuncio debe ser un número entero positivo.'),
    validateFields
];

module.exports = {
    validateCreateAnnouncement,
    validateAnnouncementId
};