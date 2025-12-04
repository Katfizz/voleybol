const { Router } = require('express');
const { validateJWT } = require('../middlewares');
const { getProfileController } = require('../controllers/profile.controller');

const router = Router();

// Todas las rutas en este archivo requieren un token JWT válido.
router.use(validateJWT);

// GET /api/profile - Obtiene el perfil del usuario logueado.
router.get('/', getProfileController);

module.exports = router;