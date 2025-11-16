const authMiddleware = require('./auth.middleware');
const authValidators = require('./auth.validators');
const userValidators = require('./user.validators');
const validateFields = require('./validate-fields');

module.exports = {
    ...authMiddleware,
    ...authValidators,
    ...userValidators,
    ...validateFields,
};
