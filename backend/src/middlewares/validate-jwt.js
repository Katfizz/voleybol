const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const validateJWT = async (req = request, res = response, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token o el formato es incorrecto.'
        });
    }

    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: payload.uid } });

        if (!user) {
            return res.status(401).json({ ok: false, msg: 'Token no válido - usuario no existe.' });
        }

        // Adjuntar el objeto de usuario completo a la request
        req.user = user;

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido.'
        });
    }

    next();
};

module.exports = {
    validateJWT
}
