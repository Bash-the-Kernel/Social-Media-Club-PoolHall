// profile.routes.js
const express = require('express');
const { ensureAuthenticated } = require('../middleware/auth.middleware');
const profileController = require('../controllers/profile.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const avatarUpload = multer({ storage: avatarStorage });

const router = express.Router();

// Update profile route
router.post('/', ensureAuthenticated, avatarUpload.single('avatar'), profileController.updateProfile);

module.exports = router;