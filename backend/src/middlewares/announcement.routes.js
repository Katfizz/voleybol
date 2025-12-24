const { Router } = require('express');
const { validateJWT, validateRole, validateCreateAnnouncement, validateAnnouncementId } = require('../middlewares');
const { create, getActive, getAll, remove } = require('../controllers/announcement.controller');

const router = Router();

// Obtener anuncios activos (visible para todos los usuarios autenticados)
router.get('/', validateJWT, getActive);

// Obtener todos los anuncios (historial completo, solo ADMIN)
router.get('/all', [
    validateJWT,
    validateRole(['ADMIN'])
], getAll);

// Crear un anuncio (ADMIN y COACH)
router.post('/', [
    validateJWT,
    validateRole(['ADMIN', 'COACH']),
    validateCreateAnnouncement
], create);

// Eliminar un anuncio (ADMIN y COACH - validación de autoría en servicio)
router.delete('/:id', [
    validateJWT,
    validateRole(['ADMIN', 'COACH']),
    validateAnnouncementId
], remove);

module.exports = router;