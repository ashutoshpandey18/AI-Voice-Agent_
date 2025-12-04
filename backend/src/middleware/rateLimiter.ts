import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

// General API rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for booking creation - 10 requests per hour
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Too many booking requests',
    message: 'You have exceeded the booking limit. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin endpoints limiter - 200 requests per 15 minutes
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    error: 'Too many admin requests',
    message: 'You have exceeded the admin API limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export endpoints limiter - 20 requests per hour
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    error: 'Too many export requests',
    message: 'You have exceeded the export limit. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Agent conversation limiter - 50 requests per 15 minutes
export const agentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    error: 'Too many conversation requests',
    message: 'You have exceeded the conversation limit. Please take a break and try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
