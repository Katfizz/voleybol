const { Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ConflictError, UnauthorizedError, ForbiddenError, AppError } = require('../utils/errors');
const prisma = require('../db/prisma');

const generateJWT = (uid, email) => { // Changed name to email for consistency
    return new Promise((resolve, reject) => {
        const payload = { uid, email }; // Changed name to email for consistency
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};

const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new UnauthorizedError('Credenciales no válidas');
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
        throw new UnauthorizedError('Credenciales no válidas');
    }

    const token = await generateJWT(user.id, user.email);
    
    const { password_hash: _, ...userResponse } = user;

    return { user: { ...userResponse, role: user.role }, token };
};

module.exports = {
    loginUser
};