/**
 * Clase base para errores de aplicación personalizados.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error para peticiones con datos que entran en conflicto con recursos existentes.
 * HTTP Status Code: 409
 */
class ConflictError extends AppError {
    constructor(message = 'El recurso ya existe.') {
        super(message, 409);
    }
}

/**
 * Error para intentos de autenticación fallidos.
 * HTTP Status Code: 401
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Credenciales no válidas.') {
        super(message, 401);
    }
}

/**
 * Error para peticiones malformadas o con datos inválidos.
 * HTTP Status Code: 400
 */
class BadRequestError extends AppError {
    constructor(message = 'Petición incorrecta.') {
        super(message, 400);
    }
}

module.exports = {
    AppError,
    ConflictError,
    UnauthorizedError,
    BadRequestError
};
