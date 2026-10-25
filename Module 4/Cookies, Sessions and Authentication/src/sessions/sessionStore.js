
const crypto = require('crypto');

const sessions = new Map();

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 3600000);

function createSession(userId) {
  const sessionId = crypto.randomUUID();

  const session = {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  sessions.set(sessionId, session);

  return {
    sessionId,
    expiresAt: session.expiresAt,
  };
}

function getSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

function deleteSession(sessionId) {
  if (sessionId) {
    sessions.delete(sessionId);
  }
}

module.exports = {
  createSession,
  getSession,
  deleteSession,
};
