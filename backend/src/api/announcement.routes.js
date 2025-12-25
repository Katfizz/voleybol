const { Router } = require('express');
const { validateJWT, hasRole, validateCreateAnnouncement, validateAnnouncementId } = require('../middlewares');
const { create, getActive, getAll, remove } = require('../controllers/announcement.controller');

const router = Router();

// Obtener anuncios activos (visible para todos los usuarios autenticados)
router.get('/', validateJWT, getActive);

// Obtener todos los anuncios (historial completo, solo ADMIN)
router.get('/all', [
    validateJWT,
    hasRole('ADMIN')
], getAll);

// Crear un anuncio (ADMIN y COACH)
router.post('/', [
    validateJWT,
    hasRole('ADMIN', 'COACH'),
    validateCreateAnnouncement
], create);

// Eliminar un anuncio (ADMIN y COACH - validación de autoría en servicio)
router.delete('/:id', [
    validateJWT,
    hasRole('ADMIN', 'COACH'),
    validateAnnouncementId
], remove);

module.exports = router;