const prisma = require('../db/prisma');
const { AppError } = require('../utils/errors');

const getProfile = async (userId) => {
  const profile = await prisma.playerProfile.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      full_name: true,
      birth_date: true,
      position: true,
    },
  });

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  return profile;
};

module.exports = {
  getProfile,
};
