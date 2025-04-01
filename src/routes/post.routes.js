
// src/routes/post.routes.js
const express = require('express');
const postController = require('../controllers/post.controller');
const { ensureAuthenticated, allowGuest } = require('../middleware/auth.middleware');

const router = express.Router();

// Post routes
router.post('/', ensureAuthenticated, postController.createPost);
router.get('/feed', ensureAuthenticated, postController.getFeedPosts);
router.get('/user/:userId', allowGuest, postController.getUserPosts);
router.get('/:id', allowGuest, postController.getPostById);
router.delete('/:id', ensureAuthenticated, postController.deletePost);

module.exports = router;