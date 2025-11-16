const { response } = require('express');
const authService = require('../services/auth.service');
const { AppError } = require('../utils/errors');

/**
 * Manejador de errores centralizado para el controlador.
 * @param {response} res - El objeto de respuesta de Express.
 * @param {Error} error - El error capturado.
 */
const handleHttpError = (res, error) => {
    console.error("Error en la capa de autenticación:", error.message);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            ok: false,
            msg: error.message
        });
    }
    
    // Para cualquier otro tipo de error, devolver un 500 genérico.
    return res.status(500).json({
        ok: false,
        msg: 'Ocurrió un error inesperado en el servidor.'
    });
};

const login = async (req, res = response) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser({ email, password });

        res.status(200).json({
            ok: true,
            msg: 'Inicio de sesión exitoso',
            user,
            token
        });
    } catch (error) {
        handleHttpError(res, error);
    }
};

module.exports = {
    login
};