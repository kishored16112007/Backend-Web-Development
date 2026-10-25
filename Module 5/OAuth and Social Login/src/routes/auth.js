
'use strict';

const router = require('express').Router();
const { passport } = require('../auth/passport');
const { signToken } = require('../utils/jwt');

// Start Google OAuth login.
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
    session: false,
  }),
);

// Handle the Google OAuth callback.
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/failure',
  }),
  (req, res) => {
    const token = signToken({
      sub: req.user.id,
      role: req.user.role,
    });

    return res.json({ token });
  },
);

// Handle failed or denied Google login.
router.get('/failure', (_req, res) => {
  res.status(401).json({
    error: {
      code: 'OAUTH_FAILED',
      message: 'Google login failed or was denied',
    },
  });
});

module.exports = router;
