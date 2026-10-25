
require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const { AppError } = require('./services/authService');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Do not expose database, bcrypt, or internal error details.
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
