const { getProfile } = require('../services/profile.service');
const { handleHttpError } = require('../utils/errors');

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
        handleHttpError(res, error);
    }
};

module.exports = {
    getProfileController,
};