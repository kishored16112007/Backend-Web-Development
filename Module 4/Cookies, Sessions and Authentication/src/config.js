
const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_NAME = 'sid';

const cookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: 'lax',
  secure: isProduction
    ? true
    : process.env.COOKIE_SECURE === 'true',
  path: '/',
  maxAge: Number(process.env.SESSION_TTL_MS || 3600000),
};

module.exports = {
  COOKIE_NAME,
  cookieOptions,
};
