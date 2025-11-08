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

const register = async (req, res = response) => {
    try {
        // req.user es el usuario que hace la petición (obtenido del JWT)
        // req.body contiene los datos del nuevo usuario a crear
        const { user } = await authService.registerUser(req.body, req.user);

        res.status(201).json({
            ok: true,
            msg: 'Usuario creado exitosamente por un administrador.',
            user
        });
    } catch (error) {
        handleHttpError(res, error);
    }
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
    register,
    login
};