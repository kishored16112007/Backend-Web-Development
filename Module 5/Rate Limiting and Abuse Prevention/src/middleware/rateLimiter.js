
'use strict';

const rateLimit = require('express-rate-limit');

// Redis-backed storage (rate-limit-redis) can share rate-limit counters
// across multiple server instances. The default in-memory store keeps
// counters separately in each process, so a load balancer can distribute
// requests across instances and weaken the intended limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = authLimiter;
