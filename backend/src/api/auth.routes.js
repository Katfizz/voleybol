const { Router } = require('express');
const { login, register } = require('../controllers/auth.controller');
const { loginValidation, validateJWT, canCreateUser, userCreationValidation } = require('../middlewares');

const router = Router();

router.post(
    '/login',
    loginValidation,
    login
);

module.exports = router;