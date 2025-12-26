const { Router } = require('express');
const { validateJWT, hasRole, validateCreateAnnouncement, validateAnnouncementId, validateUpdateAnnouncement } = require('../middlewares');
const { create, getActive, getAll, getById, update, remove } = require('../controllers/announcement.controller');

const router = Router();

// Públicos (Autenticados)
router.get('/', validateJWT, getActive);

// Admin (Historial completo)
router.get('/all', [validateJWT, hasRole('ADMIN')], getAll);

// Obtener por ID (Cualquiera autenticado)
router.get('/:id', [validateJWT, validateAnnouncementId], getById);

// Crear (Admin, Coach)
router.post('/', [
    validateJWT,
    hasRole('ADMIN', 'COACH'),
    validateCreateAnnouncement
], create);

// Actualizar (Admin, Coach)
router.put('/:id', [
    validateJWT,
    hasRole('ADMIN', 'COACH'),
    validateUpdateAnnouncement
], update);

// Eliminar (Admin, Coach)
router.delete('/:id', [validateJWT, hasRole('ADMIN', 'COACH'), validateAnnouncementId], remove);

module.exports = router;