
const express = require('express');
const bcrypt = require('bcryptjs');

const {
  findUserByEmail,
  findUserById,
} = require('../repositories/userRepository');

const {
  createSession,
  getSession,
  deleteSession,
} = require('../sessions/sessionStore');

const {
  COOKIE_NAME,
  cookieOptions,
} = require('../config');

const router = express.Router();

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function unauthorized(res) {
  return res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired session or credentials',
    },
  });
}

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!email || !password) {
      return unauthorized(res);
    }

    const user = await findUserByEmail(email);

    // Use the same public error for an unknown email and wrong password.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return unauthorized(res);
    }

    const { sessionId } = createSession(user.id);

    res.cookie(COOKIE_NAME, sessionId, cookieOptions);

    return res.status(200).json({
      user: safeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

// GET /auth/me
router.get('/me', async (req, res, next) => {
  try {
    const sessionId = req.signedCookies?.[COOKIE_NAME];

    if (
      typeof sessionId !== 'string' ||
      !sessionId
    ) {
      return unauthorized(res);
    }

    const session = getSession(sessionId);

    if (!session) {
      return unauthorized(res);
    }

    const user = await findUserById(session.userId);

    if (!user) {
      deleteSession(sessionId);
      return unauthorized(res);
    }

    return res.status(200).json({
      user: safeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

// POST /auth/logout
router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies?.[COOKIE_NAME];

    if (typeof sessionId === 'string' && sessionId) {
      deleteSession(sessionId);
    }

    res.clearCookie(COOKIE_NAME, {
      ...cookieOptions,
      maxAge: undefined,
    });

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
