const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { validateJWT } = require('../middlewares/validate-jwt');

// GET /api/users
// Se añade el middleware validateJWT. Se ejecutará antes que userController.getAllUsers
router.get('/', validateJWT, userController.getAllUsers);

module.exports = router;
