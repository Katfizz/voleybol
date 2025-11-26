const profileService = require('../services/profile.service');

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const profile = await profileService.getProfile(id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
};
