const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const { ConflictError, UnauthorizedError, ForbiddenError } = require('../utils/errors');

const prisma = new PrismaClient();

const generateJWT = (uid, name) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, name };
        jwt.sign(payload, jwtSecret, { expiresIn: '2h' }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};

const registerUser = async (newUserData, requestingUser) => {
    const { email, password, role: roleToCreate } = newUserData;
    const { role: requesterRole } = requestingUser;

    // Regla 1: Prohibir la creación de ADMIN a través de la API
    if (roleToCreate === 'ADMIN') {
        throw new ForbiddenError('La creación de administradores no está permitida a través de la API.');
    }

    // Regla 2: Solo un ADMIN puede crear un COACH
    if (roleToCreate === 'COACH') {
        if (requesterRole !== 'ADMIN') {
            throw new ForbiddenError('Solo un administrador puede crear un Entrenador.');
        }
    }

    // Regla 3: Solo ADMIN o COACH pueden crear un PLAYER
    if (roleToCreate === 'PLAYER') {
        if (requesterRole !== 'ADMIN' && requesterRole !== 'COACH') {
            throw new ForbiddenError('Solo un Administrador o Entrenador puede crear un Jugador.');
        }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ConflictError('El correo electrónico ya está en uso');
    }

    const salt = bcrypt.genSaltSync();
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({ 
        data: { email, password_hash, role: roleToCreate }
    });

    // No devolver el hash de la contraseña
    const { password_hash: _, ...user } = newUser;

    // La función ya no devuelve un token, solo el usuario creado.
    return { user };
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

    return { user: userResponse, token };
};

module.exports = {
    registerUser,
    loginUser
};