
// src/routes/follow.routes.js
const express = require('express');
const followController = require('../controllers/follow.controller');
const { ensureAuthenticated } = require('../middleware/auth.middleware');

const router = express.Router();

// All follow routes require authentication
router.use(ensureAuthenticated);

// Follow routes
router.post('/', followController.sendFollowRequest);
router.put('/:followId/accept', followController.acceptFollowRequest);
router.put('/:followId/reject', followController.rejectFollowRequest);
router.delete('/:userId', followController.unfollowUser);
router.get('/pending', followController.getPendingFollowRequests);
router.get('/user/:userId/followers', followController.getFollowers);
router.get('/user/:userId/following', followController.getFollowing);

module.exports = router;