const { response } = require('express');
const authService = require('../services/auth.service');
const { handleHttpError } = require('../utils/errors');

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

const register = async (req, res = response) => {
    try {
        const user = await authService.registerUser(req.body, req.user);

        res.status(201).json({
            ok: true,
            msg: 'Usuario creado exitosamente.',
            user
        });
    } catch (error) {
        handleHttpError(res, error);
    }
}

module.exports = {
    login,
    register
};