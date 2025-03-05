
const express = require('express');
const passport = require('../config/passport');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

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

    // Create profile automatically

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: newUser.id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login Route
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ 
    message: 'Login successful', 
    user: { 
      id: req.user.id, 
      username: req.user.username 
    } 
  });
});

// Logout Route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { 
      return res.status(500).json({ message: 'Error logging out' }); 
    }
    res.json({ message: 'Logout successful' });
  });
});

module.exports = router;