
// src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/guest', authController.guestLogin);

module.exports = router;