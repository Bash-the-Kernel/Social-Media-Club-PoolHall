// src/controllers/like.controller.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Like a post
const likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: Number(postId)
        }
      }
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'Post already liked' });
    }
    
    // Create like
    const like = await prisma.like.create({
      data: {
        userId,
        postId: Number(postId)
      }
    });
    
    return res.status(201).json({
      message: 'Post liked successfully',
      like
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Unlike a post
const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    // Find the like
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: Number(postId)
        }
      }
    });
    
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }
    
    // Delete the like
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId: Number(postId)
        }
      }
    });
    
    return res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get users who liked a post
const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const likes = await prisma.like.findMany({
      where: {
        postId: Number(postId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        }
      }
    });
    
    return res.json(likes);
  } catch (error) {
    console.error('Error fetching post likes:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes
};