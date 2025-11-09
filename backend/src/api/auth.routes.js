const { Router } = require('express');
const { register, login } = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../middlewares/auth.validators');

const router = Router();

router.post(
    '/register',
    registerValidation,
    register
);

router.post(
    '/login',
    loginValidation,
    login
);

module.exports = router;