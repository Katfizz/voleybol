const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const validateJWT = (req = request, res = response, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'Error de autenticación'
        });
    }

    // Verificar que el token venga con el prefijo 'Bearer '
    if (!token.startsWith('Bearer ')) {
        return res.status(401).json({
            ok: false,
            msg: 'Error de autenticación'
        });
    }

    try {
        // Quitar el prefijo 'Bearer ' para obtener el token puro
        const tokenValue = token.split(' ')[1];

        const payload = jwt.verify(
            tokenValue,
            jwtSecret
        );

        // Adjuntar el payload (que contiene uid y name/email) al objeto request
        req.uid = payload.uid;
        req.name = payload.name;

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }

    next();
};

module.exports = {
    validateJWT
}
