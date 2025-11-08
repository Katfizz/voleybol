const { response } = require('express');
const authService = require('../services/auth.service');

const register = async (req, res = response) => {
    try {
        const { email, password, role } = req.body;
        const { user, token } = await authService.registerUser({ email, password, role });

        res.status(201).json({
            ok: true,
            msg: 'Usuario registrado exitosamente',
            user,
            token
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: error.message || 'Error al registrar el usuario'
        });
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
        res.status(400).json({
            ok: false,
            msg: error.message || 'Error al iniciar sesión'
        });
    }
};

module.exports = {
    register,
    login
};