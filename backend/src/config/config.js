require('dotenv').config();

const config = {
    port: process.env.PORT || '3001',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiration: process.env.TOKEN_EXPIRATION || '2h', // Valor por defecto
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com', // Valor por defecto
    adminPassword: process.env.ADMIN_PASSWORD || 'password123', // Valor por defecto
};

// Validar configuración esencial
if (!config.jwtSecret) {
    console.error('FATAL ERROR: La variable de entorno JWT_SECRET no está definida.');
    process.exit(1); // Detiene la aplicación si la variable no existe
}

if (!config.databaseUrl) {
    console.error('FATAL ERROR: La variable de entorno DATABASE_URL no está definida.');
    process.exit(1); // Detiene la aplicación si la variable no existe
}

// Validación para tokenExpiration
if (!process.env.TOKEN_EXPIRATION) {
    console.warn('WARNING: La variable de entorno TOKEN_EXPIRATION no está definida. Se usará el valor por defecto "2h".');
}

// Validaciones para las variables del seeder (usando las variables originales de process.env)
if (!process.env.ADMIN_EMAIL) {
    console.warn('WARNING: La variable de entorno ADMIN_EMAIL no está definida. Se usará el valor por defecto para el seed.');
}

if (!process.env.ADMIN_PASSWORD) {
    console.warn('WARNING: La variable de entorno ADMIN_PASSWORD no está definida. Se usará el valor por defecto para el seed.');
}

module.exports = config;
