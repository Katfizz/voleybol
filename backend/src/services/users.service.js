const prisma = require('../db/prisma');

const getAllUsers = async () => {
    // Use Prisma Client to fetch all users
    return await prisma.user.findMany({
        // Optionally, you can include related data, like player profiles
        // include: { profile: true }
    });
};

module.exports = {
    getAllUsers,
};
