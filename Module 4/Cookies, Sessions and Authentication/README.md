# Cookies, Sessions and Authentication

## Overview

This project demonstrates authentication using Express, bcrypt, signed cookies, and server-side sessions. Prisma and SQLite are used to retrieve user records.

## Requirements

- Node.js
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file by copying `.env.example` to `.env`.

3. Set a strong, randomly generated `COOKIE_SECRET` in `.env`. Do not commit `.env` or share the secret.

4. Set up the database and seed the demo user:

   ```bash
   npm run setup
   ```

5. Start the server:

   ```bash
   npm start
   ```

The API runs on the configured port, defaulting to `3000`.

## Demo credentials

- Email: `sam@example.com`
- Password: `SessionDemo!48`

Use these credentials only for local development.

## API endpoints

### POST `/auth/login`

Accepts an email and password. The email is trimmed and normalized, and the password is checked using bcrypt.

A successful login creates a server-side session and sets a signed `sid` cookie. The response contains only the user's safe identity fields.

### GET `/auth/me`

Reads the signed session cookie, checks the server-side session and expiry, and returns the authenticated user's safe identity.

Missing, invalid, expired, or logged-out sessions receive `401 Unauthorized`.

### POST `/auth/logout`

Deletes the server-side session when present and clears the session cookie. The endpoint returns `204 No Content`.

## Cookie security

The session cookie uses `HttpOnly`, `SameSite=Lax`, `Path=/`, and a signature based on `COOKIE_SECRET`. Secure cookies are enabled in production and can be configured locally using `COOKIE_SECURE`.

Production deployments must use HTTPS. Keep the secret outside source control.

## Session storage limitation

This learning project stores sessions in an in-memory Map. Sessions are lost when the server restarts, and the store is not shared across multiple server instances. For production, use a persistent, shared session store with expiration, such as Redis.

## Manual testing

Test login, access `/auth/me` with the returned cookie, log out, and retry the old cookie. Also test `/auth/me` without a cookie and with a tampered cookie. Successful login should return `200`, logout should return `204`, and invalid sessions should return `401`.
