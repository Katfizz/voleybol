const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

const prisma = new PrismaClient();

const generateJWT = (uid, name) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, name };
        // Corregido: Usar '2h' directamente como se hizo originalmente.
        jwt.sign(payload, jwtSecret, { expiresIn: '2h' }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};

const registerUser = async ({ email, password, role }) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ConflictError('El correo electrónico ya está en uso');
    }

    const salt = bcrypt.genSaltSync();
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({ 
        data: { email, password_hash, role }
    });

    const token = await generateJWT(newUser.id, newUser.email);

    // No enviar el hash de la contraseña al cliente
    const { password_hash: _, ...user } = newUser;

    return { user, token };
};

const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Usar el mismo error para no dar pistas sobre si el email existe o no.
        throw new UnauthorizedError('Credenciales no válidas');
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
        throw new UnauthorizedError('Credenciales no válidas');
    }

    const token = await generateJWT(user.id, user.email);
    
    // No enviar el hash de la contraseña al cliente
    const { password_hash: _, ...userResponse } = user;

    return { user: userResponse, token };
};

module.exports = {
    registerUser,
    loginUser
};