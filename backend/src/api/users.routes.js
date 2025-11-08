const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');

// GET /api/users
router.get('/', userController.getAllUsers);

module.exports = router;
