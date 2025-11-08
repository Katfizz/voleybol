require('dotenv').config();

const config = {
    port: process.env.PORT || 3001,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET
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

module.exports = config;
