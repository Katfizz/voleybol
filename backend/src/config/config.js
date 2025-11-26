require('dotenv').config();

const config = {
    port: process.env.PORT || 3001,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiration: process.env.TOKEN_EXPIRATION || '2h', // Usar '2h' como default es más legible
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
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

if (!config.tokenExpiration) {
    console.error('FATAL ERROR: La variable de entorno TOKEN_EXPIRATION no está definida.');
    process.exit(1); // Detiene la aplicación si la variable no existe
}

// Validaciones para las variables del seeder
if (!config.adminEmail) {
    console.warn('WARNING: La variable de entorno ADMIN_EMAIL no está definida. El script de seed podría fallar.');
}

if (!config.adminPassword) {
    console.warn('WARNING: La variable de entorno ADMIN_PASSWORD no está definida. El script de seed podría fallar.');
}


module.exports = config;
