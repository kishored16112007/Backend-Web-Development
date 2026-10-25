
'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;

    if (!googleId || !email) {
      return done(null, false);
    }

    // 1. Check Google ID first for returning users.
    let user = users.find((u) => u.googleId === googleId);

    if (user) {
      return done(null, user);
    }

    // 2. Find an existing account by email.
    user = users.find((u) => u.email === email);

    if (user) {
      // Only link accounts when Google confirms the email.
      if (profile._json?.email_verified !== true) {
        return done(null, false);
      }

      user.googleId = googleId;
      return done(null, user);
    }

    // 3. Create a new account with the least-privileged role.
    const newUser = {
      id: nextId(),
      googleId,
      email,
      name: profile.displayName,
      role: 'member',
    };

    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/auth/google/callback',
    },
    verifyCallback,
  ),
);

module.exports = { passport, verifyCallback };
