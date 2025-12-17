const authService = require('../services/auth.service');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const data = await authService.loginUser({ email, password });

        res.json({
            ok: true,
            msg: 'Inicio de sesión exitoso',
            user: data.user,
            token: data.token
        });
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body, req.user);

        res.status(201).json({
            ok: true,
            msg: 'Usuario creado exitosamente.',
            user
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    register
};