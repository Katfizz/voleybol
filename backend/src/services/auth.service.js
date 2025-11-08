const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const prisma = new PrismaClient();

const generateJWT = (uid, name) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, name };
        jwt.sign(payload, jwtSecret, {
            expiresIn: '2h'
        }, (err, token) => {
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
        throw new Error('El correo electrónico ya está en uso');
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
        throw new Error('Credenciales no válidas'); // Usuario no encontrado
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
        throw new Error('Credenciales no válidas'); // Contraseña incorrecta
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