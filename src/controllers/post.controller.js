// src/controllers/post.controller.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create a new post// src/controllers/post.controller.js
const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    // Create post
    await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || '', // Default to an empty string if no image URL is provided
        userId,
      }
    });

    // Redirect back to the feed page
    res.redirect('/feed');
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).render('error', { message: 'Error creating post' });
  }
};
// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: { 
                  select: { avatarUrl: true } 
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    return res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get feed posts (from user and followed users)
const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get IDs of users the current user follows
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
        status: 'accepted'
      },
      select: {
        followedId: true
      }
    });
    
    const followingIds = following.map(follow => follow.followedId);
    
    // Add current user's ID to show their posts too
    followingIds.push(userId);
    
    // Get posts from followed users and current user
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: followingIds
        }
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
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit for pagination
    });
    
    return res.json(posts);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const posts = await prisma.post.findMany({
      where: {
        userId: Number(userId)
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
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the post
    const post = await prisma.post.findUnique({
      where: { id: Number(id) }
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    // Delete the post
    await prisma.post.delete({
      where: { id: Number(id) }
    });
    
    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getPostById,
  getFeedPosts,
  getUserPosts,
  deletePost
};

