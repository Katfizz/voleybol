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

module.exports = { validateRecordStats };