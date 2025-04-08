// src/controllers/follow.controller.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Send a follow request
const sendFollowRequest = async (req, res) => {
  try {
    const { followedId } = req.body;
    const followerId = req.user.id;
    
    // Validate input
    if (!followedId) {
      return res.status(400).json({ message: 'User ID to follow is required' });
    }
    
    // Convert to number if needed
    const followedIdNum = Number(followedId);
    
    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followedIdNum }
    });
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User to follow not found' });
    }
    
    // Can't follow yourself
    if (followerId === followedIdNum) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    // Check if follow relationship already exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: followerId,
          followedId: followedIdNum
        }
      }
    });
    
    if (existingFollow) {
      return res.status(400).json({ 
        message: `Follow request already ${existingFollow.status}`
      });
    }
    
    // Create follow request
    const followRequest = await prisma.follow.create({
      data: {
        followerId: followerId,
        followedId: followedIdNum,
        status: 'pending'
      }
    });
    
    // Check if this is an AJAX request or a form submission
    if (req.xhr) {
      return res.status(201).json({ 
        message: 'Follow request sent',
        follow: followRequest
      });
    } else {
      // Redirect back to the profile page
      return res.redirect(`/profile/${followedIdNum}`);
    }
  } catch (error) {
    console.error('Error sending follow request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Accept a follow request
const acceptFollowRequest = async (req, res) => {
  try {
    const { followId } = req.params;
    
    // Find the follow request
    const followRequest = await prisma.follow.findUnique({
      where: { id: Number(followId) },
    });
    
    if (!followRequest) {
      return res.status(404).json({ message: 'Follow request not found' });
    }
    
    // Ensure only the followed user can accept
    if (followRequest.followedId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }
    
    // Check if already accepted
    if (followRequest.status === 'accepted') {
      return res.status(400).json({ message: 'Follow request already accepted' });
    }
    
    // Update status to accepted
    const updatedFollow = await prisma.follow.update({
      where: { id: Number(followId) },
      data: { status: 'accepted' }
    });
    
    // Check if this is an AJAX request or a form submission
    if (req.xhr) {
      return res.json({
        message: 'Follow request accepted',
        follow: updatedFollow
      });
    } else {
      // Redirect back to the profile page
      return res.redirect(`/profile/${followRequest.followerId}`);
    }
  } catch (error) {
    console.error('Error accepting follow request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Reject a follow request
const rejectFollowRequest = async (req, res) => {
  try {
    const { followId } = req.params;
    
    // Find the follow request
    const followRequest = await prisma.follow.findUnique({
      where: { id: Number(followId) },
    });
    
    if (!followRequest) {
      return res.status(404).json({ message: 'Follow request not found' });
    }
    
    // Ensure only the followed user can reject
    if (followRequest.followedId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }
    
    // Delete the follow request
    await prisma.follow.delete({
      where: { id: Number(followId) }
    });
    
    // Check if this is an AJAX request or a form submission
    if (req.xhr) {
      return res.json({
        message: 'Follow request rejected'
      });
    } else {
      // Redirect back to the profile page
      return res.redirect(`/profile/${followRequest.followerId}`);
    }
  } catch (error) {
    console.error('Error rejecting follow request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;
    
    // Find the follow relationship
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: followerId,
          followedId: Number(userId)
        }
      }
    });
    
    if (!follow) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }
    
    // Delete the follow relationship
    await prisma.follow.delete({
      where: { id: follow.id }
    });
    
    // Check if this is an AJAX request or a form submission
    if (req.xhr) {
      return res.json({
        message: 'Unfollowed user successfully'
      });
    } else {
      // Redirect back to the profile page
      return res.redirect(`/profile/${userId}`);
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get pending follow requests for the current user
const getPendingFollowRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pendingRequests = await prisma.follow.findMany({
      where: {
        followedId: userId,
        status: 'pending'
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });
    
    return res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get followers of a user
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const followers = await prisma.follow.findMany({
      where: {
        followedId: Number(userId),
        status: 'accepted'
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });
    
    return res.json(followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const following = await prisma.follow.findMany({
      where: {
        followerId: Number(userId),
        status: 'accepted'
      },
      include: {
        followed: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });
    
    return res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  unfollowUser,
  getPendingFollowRequests,
  getFollowers,
  getFollowing
};