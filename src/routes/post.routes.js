// src/routes/post.routes.js
const express = require('express');
const postController = require('../controllers/post.controller');
const { ensureAuthenticated, allowGuest } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer storage for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Save files to the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

// Post routes
router.post('/', ensureAuthenticated, upload.single('image'), postController.createPost);
router.get('/feed', ensureAuthenticated, postController.getFeedPosts);
router.get('/user/:userId', allowGuest, postController.getUserPosts);
router.get('/:id', allowGuest, postController.getPostById);
router.delete('/:id', ensureAuthenticated, postController.deletePost);

module.exports = router;