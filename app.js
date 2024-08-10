// Import necessary modules
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const createError = require('http-errors');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Load environment variables
require('dotenv').config();

// Import your user model and routes
const userModel = require('./routes/users'); // Adjust the path as needed

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Initialize Express app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Security and Session setup
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Use with caution
          "https://code.jquery.com", // Allow scripts from jQuery CDN
          "https://cdn.jsdelivr.net", // Allow scripts from jsDelivr CDN
          "https://stackpath.bootstrapcdn.com", // Allow scripts from Bootstrap CDN
          "https://js.stripe.com" // Allow Stripe scripts
        ],
        frameSrc: [
          "'self'",
          "https://js.stripe.com" // Allow framing from Stripe
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Use with caution
          "https://maxcdn.bootstrapcdn.com", // Allow styles from Bootstrap CDN
          "https://stackpath.bootstrapcdn.com", // Allow styles from Bootstrap CDN
          "https://cdnjs.cloudflare.com" // Allow styles from Font Awesome CDN
        ],
        // Add other directives as needed
      },
    },
  })
);
app.use(flash());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET, // Use environment variable for session secret
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(userModel.authenticate())); // Adjust as per your configuration
passport.serializeUser(userModel.serializeUser()); // Adjust as per your configuration
passport.deserializeUser(userModel.deserializeUser()); // Adjust as per your configuration

// Configure GitHub strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'https://wonderfulstay.vercel.app/oauth-callback'
},
function(accessToken, refreshToken, profile, done) {
  userModel.findOrCreate({ githubId: profile.id }, function (err, user) {
    return done(err, user);
  });
}));

// Configure Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
},
function(accessToken, refreshToken, profile, done) {
  userModel.findOrCreate({ googleId: profile.id }, function (err, user) {
    return done(err, user);
  });
}));

// Middleware setup
app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Authentication routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile'); // Redirect after successful login
  }
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile'); // Redirect after successful login
  }
);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals for error information
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Log error details for debugging
  console.error(err.stack);

  // Render error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;
