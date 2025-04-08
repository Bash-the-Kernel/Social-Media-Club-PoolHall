const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Local Strategy (already implemented)
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return done(null, false, { message: 'Incorrect username' });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return done(null, false, { message: 'Incorrect password' });

      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));
// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback',  // Updated to match your GitHub settings
  scope: ['user:email']  // Make sure this scope is requested
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Handle case when email might not be available
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
    const username = profile.username;

    let user = await prisma.user.findUnique({ 
      where: { 
        email 
      }
    });
    
    if (!user) {
      // Create a random password for OAuth users
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: await bcrypt.hash(randomPassword, 10), // Add password field
          profile: { 
            create: { 
              avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null 
            } 
          }
        }
      });
    }

    return done(null, user);
  } catch (error) {
    console.error("GitHub auth error:", error);
    return done(error);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',  // Updated to match your Google settings
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (!email) {
      return done(new Error("No email found in Google profile"));
    }
    
    const username = profile.displayName || email.split('@')[0];

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create a random password for OAuth users
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: await bcrypt.hash(randomPassword, 10), // Add password field
          profile: { 
            create: { 
              avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null 
            } 
          }
        }
      });
    }

    return done(null, user);
  } catch (error) {
    console.error("Google auth error:", error);
    return done(error);
  }
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;