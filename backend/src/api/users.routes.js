const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { validateJWT, isAdminRole, canCreateUser } = require('../middlewares/auth.middleware');
const { userUpdateValidation, userCreationValidation } = require('../middlewares/request.validators');

// GET all users - Admin only
router.get('/', validateJWT, isAdminRole, userController.getAllUsers);

// POST create user
router.post('/', validateJWT, canCreateUser, userCreationValidation, userController.createUser);

// GET user by ID - Admin or the user themselves
router.get('/:id', validateJWT, userController.getUserById);

// PUT update user by ID - Admin or the user themselves
router.put('/:id', validateJWT, userUpdateValidation, userController.updateUser);

// DELETE user by ID - Admin only
router.delete('/:id', validateJWT, isAdminRole, userController.deleteUser);

module.exports = router;
