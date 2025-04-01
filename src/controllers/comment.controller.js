// src/controllers/comment.controller.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create a comment
const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!postId || !content) {
      return res.status(400).json({ message: 'Post ID and content are required' });
    }
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
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
    
    return res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for a post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await prisma.comment.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json(comments);
  } catch (error) {
    console.error('Error fetching post comments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) }
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete the comment
    await prisma.comment.delete({
      where: { id: Number(id) }
    });
    
    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComment,
  getPostComments,
  deleteComment
};

