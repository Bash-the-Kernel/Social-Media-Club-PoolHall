const express = require('express');
const session = require('express-session');
const passport = require('./src/config/passport.js'); // Updated path
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./src/routes/auth.routes');
const { PrismaClient } = require('@prisma/client');
const likeRoutes = require('./src/routes/like.routes');
const commentRoutes = require('./src/routes/comment.routes');
const postRoutes = require('./src/routes/post.routes');
const followRoutes = require('./src/routes/follow.routes');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const flash = require('connect-flash');
const methodOverride = require('method-override');

// Enable method override for forms
app.use(methodOverride('_method'));
app.use(express.static('public'));


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './src/views'); // Set the views directory

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


// Middleware for flash messages
app.use(flash());

// Pass flash messages to views
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follows', followRoutes);

// Home route for testing
app.get('/', (req, res) => {
  res.render('index', { message: 'Welcome to the Social Media API!' });
});

app.get('/login', (req, res) => {
  res.render('login');
});

// Render register page
app.get('/register', (req, res) => {
  res.render('register');
});


app.get('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  try {
    // Fetch the user with their profile
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true // Include the profile relationship
      }
    });

    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    // Create a default profile if it doesn't exist
    if (!user.profile) {
      user.profile = await prisma.profile.create({
        data: {
          userId: user.id,
          bio: '',
          location: '',
          avatarUrl: '/default-avatar.png' // Default avatar
        }
      });
    }

    res.render('profile', { user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).render('error', { message: 'Error fetching profile' });
  }
});

app.post('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  try {
    const { bio, location, avatarUrl } = req.body;

    // Update the user's profile
    await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        bio: bio || '',
        location: location || '',
        avatarUrl: avatarUrl || '/default-avatar.png'
      }
    });

    res.redirect('/profile'); // Redirect back to the profile page
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).render('error', { message: 'Error updating profile' });
  }
});
app.get('/feed', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  try {
    // Fetch posts from the database
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
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

    res.render('feed', { posts });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).render('error', { message: 'Error fetching feed' });
  }
});

app.get('/logout', (req, res) => {
  res.redirect('/api/auth/logout');
});

app.get('/post/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    // Fetch the post details from the database
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      include: {
        user: {
          select: {
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
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
      return res.status(404).render('error', { message: 'Post not found' });
    }

    res.render('post', { post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).render('error', { message: 'Error fetching post' });
  }
});

// Render error page
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle Prisma disconnect on application shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
