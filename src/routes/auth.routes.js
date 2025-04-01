const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Login Route
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login', // Redirect to login page on failure
  failureFlash: true // Optional: Enable flash messages for errors
}), (req, res) => {
  // Redirect to the feed page on successful login
  res.redirect('/feed');
});

// Registration Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {} // Creates an empty profile
        }
      }
    });

    // Automatically log in the user after registration
    req.login(newUser, (err) => {
      if (err) {
        console.error('Error logging in after registration:', err);
        return res.status(500).json({ message: 'Error logging in after registration' });
      }

      // Redirect to the feed page
      res.redirect('/feed');
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Logout Route// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ message: 'Error clearing session' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect('/'); // Redirect to the home page after logout
    });
  });
});

module.exports = router;