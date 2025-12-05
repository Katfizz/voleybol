const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { validateJWT, hasRole, canCreateUser, userUpdateValidation, userCreationValidation } = require('../middlewares');
const { Role } = require('@prisma/client');

// GET all users - Admin only
router.get('/', [
    validateJWT,
    hasRole(Role.ADMIN),
], userController.getAllUsers);

// POST para crear un nuevo usuario
router.post('/', [
    validateJWT,
    canCreateUser,
    userCreationValidation,
], userController.createUser);

// GET user by ID - Admin or the user themselves
router.get('/:id', validateJWT, userController.getUserById);

// PUT update user by ID - Admin or the user themselves
router.put('/:id', [
    validateJWT,
    userUpdateValidation,
], userController.updateUser);

// DELETE user by ID - Admin only
router.delete('/:id', [
    validateJWT,
    hasRole(Role.ADMIN),
], userController.deleteUser);

module.exports = router;
