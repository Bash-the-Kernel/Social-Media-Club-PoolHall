// src/routes/comment.routes.js
const express = require('express');
const commentController = require('../controllers/comment.controller');
const { ensureAuthenticated, allowGuest } = require('../middleware/auth.middleware');

const router = express.Router();

// Comment routes
router.post('/', ensureAuthenticated, commentController.createComment);
router.get('/post/:postId', allowGuest, commentController.getPostComments);
router.delete('/:id', ensureAuthenticated, commentController.deleteComment);

module.exports = router;