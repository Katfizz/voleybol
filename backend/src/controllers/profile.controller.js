const { getProfile } = require('../services/profile.service');
const { AppError } = require('../utils/errors');

/**
 * Controlador para obtener el perfil del usuario autenticado.
 */
const getProfileController = async (req, res) => {
    try {
        // El ID del usuario se obtiene del token JWT, que ya fue validado
        // por el middleware `validateJWT` y adjuntado a `req.user`.
        const userProfile = await getProfile(req.user.id);
        res.json({
            ok: true,
            profile: userProfile,
        });
    } catch (error) {
        // Manejo de errores centralizado sería ideal, pero por ahora esto funciona.
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

module.exports = {
    getProfileController,
};