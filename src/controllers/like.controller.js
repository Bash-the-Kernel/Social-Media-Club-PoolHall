// src/controllers/like.controller.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!postId) {
      req.flash('error', 'Post ID is required');
      return res.redirect('/feed');
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) }
    });

    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/feed');
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
      req.flash('error', 'Post already liked');
      return res.redirect('/feed');
    }

    // Create like
    await prisma.like.create({
      data: {
        userId,
        postId: Number(postId)
      }
    });

    req.flash('success', 'Post liked successfully');
    res.redirect('/feed');
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).render('error', { message: 'Error liking post' });
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
      req.flash('error', 'Like not found');
      return res.redirect('/feed');
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

    req.flash('success', 'Post unliked successfully');
    res.redirect('/feed');
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).render('error', { message: 'Error unliking post' });
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