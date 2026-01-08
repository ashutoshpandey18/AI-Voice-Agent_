import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getBookings,
  getBookingById,
  deleteBooking,
  updateBookingStatus,
  getAnalytics,
  getCuisines,
  exportCsv,
  exportPdf
} from '../controllers/adminController';
import { adminLimiter, exportLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * Admin Routes
 * All routes are prefixed with /api/admin
 * All routes require authentication
 */

// Apply admin rate limiter to all admin routes
router.use(adminLimiter);

// Apply authentication to all routes
router.use(authenticate);

// Bookings routes
router.get('/bookings', getBookings);
router.get('/bookings/:id', getBookingById);
router.delete('/bookings/:id', deleteBooking);
router.patch('/bookings/:id/status', updateBookingStatus);

// Analytics routes
router.get('/analytics', getAnalytics);
router.get('/cuisines', getCuisines);

// Export routes (with stricter limits)
router.get('/export/csv', exportLimiter, exportCsv);
router.get('/export/pdf', exportLimiter, exportPdf);

export default router;
