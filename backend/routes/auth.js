const express = require('express');
const router = express.Router();
const passport = require('passport');

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Authentication]
 *     description: Redirects to Google OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback route
 *     tags: [Authentication]
 *     description: Handles the callback from Google OAuth
 *     responses:
 *       302:
 *         description: Redirect to dashboard on success, login on failure
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failed'
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Check authentication status
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Returns authentication status and user info if authenticated
 */
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        picture: req.user.picture
      }
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
      message: 'Not authenticated'
    });
  }
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Returns user profile
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      googleId: req.user.googleId,
      email: req.user.email,
      displayName: req.user.displayName,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    }
  });
});

module.exports = router;
