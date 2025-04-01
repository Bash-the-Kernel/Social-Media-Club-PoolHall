
// src/routes/like.routes.js
const express = require('express');
const likeController = require('../controllers/like.controller.js');
const { ensureAuthenticated, allowGuest } = require('../middleware/auth.middleware.js');


const router = express.Router();

// Like routes
router.post('/', ensureAuthenticated, likeController.likePost);
router.delete('/:postId', ensureAuthenticated, likeController.unlikePost);
router.get('/post/:postId', allowGuest, likeController.getPostLikes);

module.exports = router;