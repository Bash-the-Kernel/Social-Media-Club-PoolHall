// src/controllers/auth.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const passport = require('passport');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
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

    // Create user with profile
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {
            // Default Gravatar URL based on email
            avatarUrl: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(email.toLowerCase()).digest('hex')}?d=identicon`
          }
        }
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login a user
const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }
    
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.json({ message: 'Login successful', user });
    });
  })(req, res, next);
};

// Logout a user
const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    
    // Clear the session
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ message: 'Error clearing session' });
      }
      
      // Clear the cookie
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  });
};

// Guest login
const guestLogin = (req, res) => {
  // Mark session as guest
  req.session.isGuest = true;
  
  // Create a guest user object (not saved to DB)
  const guestUser = {
    id: 'guest',
    username: 'Guest User',
    isGuest: true
  };
  
  return res.json({ 
    message: 'Logged in as guest',
    user: guestUser
  });
};

module.exports = {
  register,
  login,
  logout,
  guestLogin
};