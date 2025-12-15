const authMiddleware = require('./auth.middleware');
const authValidators = require('./auth.validators');
const userValidators = require('./user.validators');
const eventValidators = require('./event.validators');
const matchValidators = require('./match.validators');
const validateFields = require('./validate-fields');

module.exports = {
    ...authMiddleware,
    ...authValidators,
    ...userValidators,
    ...eventValidators,
    ...matchValidators,
    ...validateFields,
};
