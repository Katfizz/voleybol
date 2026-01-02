const { body, param } = require('express-validator');
const { validateFields } = require('./validate-fields');

const validateRecordStats = [
    param('matchId').isInt().withMessage('ID de partido inválido'),
    body('stats').isArray({ min: 1 }).withMessage('Debe enviar una lista de estadísticas.'),
    body('stats.*.player_profile_id').isInt().withMessage('ID de perfil requerido.'),
    body('stats.*.points').optional().isInt({ min: 0 }),
    body('stats.*.kills').optional().isInt({ min: 0 }),
    body('stats.*.errors').optional().isInt({ min: 0 }),
    body('stats.*.aces').optional().isInt({ min: 0 }),
    body('stats.*.blocks').optional().isInt({ min: 0 }),
    body('stats.*.assists').optional().isInt({ min: 0 }),
    body('stats.*.digs').optional().isInt({ min: 0 }),
    validateFields
];

const validateStatId = [
    param('id').isInt().withMessage('El ID de la estadística debe ser un número entero.'),
    validateFields
];

const validateUpdateStats = [
    param('id').isInt().withMessage('El ID de la estadística debe ser un número entero.'),
    body('points').optional().isInt({ min: 0 }),
    body('kills').optional().isInt({ min: 0 }),
    body('errors').optional().isInt({ min: 0 }),
    body('aces').optional().isInt({ min: 0 }),
    body('blocks').optional().isInt({ min: 0 }),
    body('assists').optional().isInt({ min: 0 }),
    body('digs').optional().isInt({ min: 0 }),
    body().custom(body => Object.keys(body).length > 0).withMessage('Debe enviar al menos un campo para actualizar.'),
    validateFields
];

module.exports = { validateRecordStats, validateStatId, validateUpdateStats };