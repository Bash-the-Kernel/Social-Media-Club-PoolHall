const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    const { bio, location } = req.body;
    const userId = req.user.id;

    // Handle avatar upload
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : req.body.avatarUrl;

    // Update the user's profile
    await prisma.profile.update({
      where: { userId },
      data: {
        bio,
        location,
        avatarUrl,
      },
    });

    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = { updateProfile };