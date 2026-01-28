const { Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ConflictError, UnauthorizedError, ForbiddenError, AppError } = require('../utils/errors');
const prisma = require('../db/prisma');
const config = require('../config/config'); // Importar la configuración

/**
 * Genera un token JWT para un usuario.
 * @param {number} uid - El ID del usuario.
 * @param {string} email - El email del usuario.
 * @param {Role} role - El rol del usuario.
 * @returns {Promise<string>} El token JWT.
 */
const generateJWT = (uid, email, role) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, email, role }; // Incluir el rol en el payload
        jwt.sign(payload, config.jwtSecret, { expiresIn: config.tokenExpiration }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};

/**
 * Autentica a un usuario y genera un token JWT.
 * @param {object} credentials - Las credenciales del usuario.
 * @param {string} credentials.email - El email del usuario.
 * @param {string} credentials.password - La contraseña en texto plano.
 * @returns {Promise<object>} El usuario y el token.
 */
const loginUser = async ({ email, password }) => {
    // --- INICIO DE LOGS PARA DEPURACIÓN ---
    console.log(`[AUTH_SERVICE] Intentando login para email: "${email}"`);
    console.log(`[AUTH_SERVICE] Contraseña recibida: "${password}"`);
    // --- FIN DE LOGS PARA DEPURACIÓN ---

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('[AUTH_SERVICE] Error: Usuario no encontrado en la base de datos.');
        throw new UnauthorizedError('Credenciales no válidas.');
    }

    // --- LOGS ADICIONALES ---
    console.log(`[AUTH_SERVICE] Usuario encontrado. Hash en BD: "${user.password_hash}"`);
    // --- FIN DE LOGS ADICIONALES ---

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
        throw new UnauthorizedError('Credenciales no válidas.');
    }

    // Aquí se cumple lo que pides: obtenemos el rol de la BD y lo usamos para generar el token.
    const token = await generateJWT(user.id, user.email, user.role);
    
    const { password_hash: _, ...userResponse } = user;

    return { user: { ...userResponse, role: user.role }, token };
};

const registerUser = async (userData, creatorUser) => {
    const { email, password, role, ...rest } = userData;

    if (creatorUser && creatorUser.role === Role.COACH && role !== Role.PLAYER) {
        throw new ForbiddenError('Un COACH solo puede crear usuarios con rol PLAYER.');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ConflictError('El correo electrónico ya está en uso.');
    }

    const salt = bcrypt.genSaltSync();
    const password_hash = bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({
        data: { ...rest, email, role, password_hash },
    });

    const { password_hash: _, ...userResponse } = newUser;
    return userResponse;
};

module.exports = {
    loginUser,
    registerUser,
};