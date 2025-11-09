const { response } = require('express');
const { AppError } = require('../utils/errors');
const { Role } = require('@prisma/client');

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
 * Middleware para verificar si el usuario autenticado tiene el rol de ADMIN.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 * @param {Function} next - La función de middleware siguiente.
 */
const isAdminRole = (req, res = response, next) => {
    if (!req.user) {
        return res.status(500).json({
            ok: false,
            msg: 'Se quiere verificar el rol sin validar el token primero.'
        });
    }

    const { role } = req.user;

    if (role !== Role.ADMIN) {
        return res.status(403).json({
            ok: false,
            msg: `Operación no permitida. Se requiere rol de ${Role.ADMIN}.`
        });
    }

    next();
};

/**
 * Middleware para verificar si el usuario autenticado tiene el rol de ADMIN o COACH.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 * @param {Function} next - La función de middleware siguiente.
 */
const isAdminOrCoachRole = (req, res = response, next) => {
    if (!req.user) {
        return res.status(500).json({
            ok: false,
            msg: 'Se quiere verificar el rol sin validar el token primero.'
        });
    }

    const { role } = req.user;

    if (role !== Role.ADMIN && role !== Role.COACH) {
        return res.status(403).json({
            ok: false,
            msg: `Operación no permitida. Se requiere rol de ${Role.ADMIN} o ${Role.COACH}.`
        });
    }

    next();
};

module.exports = {
    canCreateUser,
    isAdminRole,
    isAdminOrCoachRole
};
