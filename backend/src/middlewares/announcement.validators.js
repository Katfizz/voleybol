const { body, param } = require('express-validator');
const { validateFields } = require('./validate-fields');

const validateCreateAnnouncement = [
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('content').notEmpty().withMessage('El contenido es obligatorio'),
    body('valid_from').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    body('valid_until').optional().isISO8601().withMessage('Fecha de fin inválida'),
    validateFields
];

const validateAnnouncementId = [
    param('id').isInt().withMessage('El ID del anuncio debe ser un número entero'),
    validateFields
];

const validateUpdateAnnouncement = [
    param('id').isInt().withMessage('El ID del anuncio debe ser un número entero'),
    body('title').optional().notEmpty().withMessage('El título no puede estar vacío'),
    body('content').optional().notEmpty().withMessage('El contenido no puede estar vacío'),
    body('valid_from').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    body('valid_until').optional({ nullable: true }).isISO8601().withMessage('Fecha de fin inválida'),
    validateFields
];

module.exports = {
    validateCreateAnnouncement,
    validateAnnouncementId,
    validateUpdateAnnouncement
};