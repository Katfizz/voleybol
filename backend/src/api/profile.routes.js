const { Router } = require('express');
const { getProfile } = require('../controllers/profile.controller');
const { authRequired } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/profile', authRequired, getProfile);

module.exports = router;
