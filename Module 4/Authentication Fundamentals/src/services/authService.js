
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const COST_FACTOR = 10;

// A valid bcrypt hash used to make unknown-email login attempts
// perform comparable password-checking work.
const DUMMY_HASH =
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function invalidCredentials() {
  return new AppError(
    401,
    'INVALID_CREDENTIALS',
    'Invalid email or password'
  );
}

function validateRegistration({ name, email, password }) {
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    throw new AppError(400, 'INVALID_INPUT', 'Name, email, and password are required');
  }
}

function validateLogin({ email, password }) {
  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    throw new AppError(400, 'INVALID_INPUT', 'Email and password are required');
  }
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register(input) {
  validateRegistration(input);

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError(
      409,
      'EMAIL_EXISTS',
      'An account with this email already exists'
    );
  }

  const passwordHash = await bcrypt.hash(input.password, COST_FACTOR);

  try {
    const user = await userRepository.createUser({
      name,
      email,
      passwordHash,
    });

    return safeUser(user);
  } catch (error) {
    // The database unique constraint also handles concurrent signups.
    if (error.code === 'P2002') {
      throw new AppError(
        409,
        'EMAIL_EXISTS',
        'An account with this email already exists'
      );
    }

    throw error;
  }
}

async function login(input) {
  validateLogin(input);

  const email = input.email.trim().toLowerCase();
  const user = await userRepository.findByEmail(email);

  if (!user) {
    await bcrypt.compare(input.password, DUMMY_HASH);
    throw invalidCredentials();
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw invalidCredentials();
  }

  return safeUser(user);
}

module.exports = {
  register,
  login,
  AppError,
};
