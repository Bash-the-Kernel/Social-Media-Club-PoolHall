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
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const flash = require('connect-flash');
const methodOverride = require('method-override');

const multer = require('multer');
const path = require('path');
app.use('/uploads', express.static('public/uploads'));
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Save files to the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});



const upload = multer({ storage });

const fs = require('fs');


const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public/uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const avatarUpload = multer({ storage: avatarStorage });

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const profileRoutes = require('./src/routes/profile.routes');

// Add an upload route
app.post('/api/uploads', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});
// Add this with your other route uses

// Enable method override for forms
app.use(methodOverride('_method'));
app.use(express.static('public'));


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './src/views'); // Set the views directory

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://files.nc.gov", "https://example.com"],
      // Add other directives as needed
    }
  })
);


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_change_in_production',
  resave: false,
  saveUninitialized: true, // Changed to true
  cookie: {
    secure: false, // Set to false for now to rule out HTTPS issues
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true // Add this for security
  },
  proxy: true // Add this for Railway's proxy setup
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

// Add this right after your session and passport initialization
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Authenticated:', req.isAuthenticated());
  if (req.user) {
    console.log('User ID:', req.user.id);
  }
  next();
});

// Routes
app.use('/api/profile', profileRoutes);
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
app.get('/profile/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  try {
    const profileUserId = parseInt(req.params.id);
    const loggedInUserId = req.user.id;

    // Redirect to /profile if the logged-in user clicks on their own profile link
    if (profileUserId === loggedInUserId) {
      return res.redirect('/profile');
    }

    // Fetch the user with their profile
    const user = await prisma.user.findUnique({
      where: { id: profileUserId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    // Check if the logged-in user is following this user
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: loggedInUserId,
          followedId: profileUserId,
        },
      },
    });

    res.render('profile', { 
      user, 
      isFollowing: !!isFollowing, 
      loggedInUser: req.user 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).render('error', { message: 'Error fetching profile' });
  }
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
/*
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
});*/
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
            id: true,  // Add this line to include user ID
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
