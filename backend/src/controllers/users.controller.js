const { response } = require('express');
const userService = require('../services/users.service');
const { AppError } = require('../utils/errors');

/**
 * Manejador de errores centralizado para el controlador.
 * @param {response} res - El objeto de respuesta de Express.
 * @param {Error} error - El error capturado.
 */
const handleHttpError = (res, error) => {
    console.error("Error en la capa de usuarios:", error.message);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            ok: false,
            msg: error.message
        });
    }
    
    // Para cualquier otro tipo de error, devolver un 500 genérico.
    return res.status(500).json({
        ok: false,
        msg: 'Ocurrió un error inesperado en el servidor.'
    });
};

const createUser = async (req, res = response) => {
    try {
        const user = await userService.createUser(req.body, req.user);

        res.status(201).json({
            ok: true,
            msg: 'Usuario creado exitosamente.',
            user
        });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const getAllUsers = async (req, res = response) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            ok: true,
            users
        });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const getUserById = async (req, res = response) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.status(200).json({
            ok: true,
            user
        });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const updatedUser = await userService.updateUser(id, req.body, req.user);
        res.status(200).json({
            ok: true,
            msg: 'Usuario actualizado exitosamente',
            user: updatedUser
        });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const deleteUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id, req.user);
        res.status(200).json({
            ok: true,
            msg: result.message
        });
    } catch (error) {
        handleHttpError(res, error);
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
