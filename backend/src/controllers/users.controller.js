const userService = require('../services/users.service');

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body, req.user);

        res.status(201).json({
            ok: true,
            msg: 'Usuario creado exitosamente.',
            user
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            ok: true,
            users
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.status(200).json({
            ok: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedUser = await userService.updateUser(id, req.body, req.user);
        res.status(200).json({
            ok: true,
            msg: 'Usuario actualizado exitosamente',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id, req.user);
        res.status(200).json({
            ok: true,
            msg: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
