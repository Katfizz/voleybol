const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const { AppError } = require('../utils/errors');
const { Role } = require('@prisma/client');

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

/**
 * Middleware para verificar si el usuario autenticado tiene permiso para crear un nuevo usuario con un rol específico.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 * @param {Function} next - La función de middleware siguiente.
 */
const canCreateUser = (req, res = response, next) => {
    const { user } = req; // Usuario autenticado que realiza la petición
    const { role: newRole } = req.body; // Rol del nuevo usuario a crear

    if (!user) {
        return next(new AppError('No se encontró información del usuario autenticado.', 401));
    }

    // Regla 1: Solo un ADMIN puede crear ADMIN o COACH
    if (newRole === Role.ADMIN || newRole === Role.COACH) {
        if (user.role !== Role.ADMIN) {
            return next(new AppError(`Solo un ${Role.ADMIN} puede crear usuarios con rol ${newRole}.`, 403));
        }
    }

    // Regla 2: ADMIN o COACH pueden crear PLAYER
    if (newRole === Role.PLAYER) {
        if (user.role !== Role.ADMIN && user.role !== Role.COACH) {
            return next(new AppError(`Solo un ${Role.ADMIN} o ${Role.COACH} puede crear usuarios con rol ${newRole}.`, 403));
        }
    }

    next();
};

/**
 * Middleware para verificar si el usuario autenticado tiene uno de los roles permitidos.
 * @param  {...Role} allowedRoles - Los roles permitidos para acceder a la ruta.
 */
const hasRole = (...allowedRoles) => {
    return (req, res = response, next) => {
        if (!req.user) {
            return res.status(500).json({
                ok: false,
                msg: 'Se quiere verificar el rol sin validar el token primero.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                ok: false,
                msg: `Servicio prohibido`
            });
        }

        next();
    }
}


module.exports = {
    validateJWT,
    canCreateUser,
    hasRole
};
