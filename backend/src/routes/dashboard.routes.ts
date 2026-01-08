import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getConversationLogs,
  getConversationById,
  getDashboardStats,
  getAvailability,
  blockTimeSlot,
  unblockTimeSlot,
  cancelBooking,
  confirmBooking
} from '../controllers/dashboardController';

const router = express.Router();

/**
 * Admin Dashboard Routes
 * Base: /api/admin/dashboard
 * All routes require authentication
 */

// Dashboard statistics
router.get('/stats', authenticate, getDashboardStats);

// Conversation logs
router.get('/conversations', authenticate, getConversationLogs);
router.get('/conversations/:sessionId', authenticate, getConversationById);

// Availability management
router.get('/availability/:date', authenticate, getAvailability);
router.post('/slots/block', authenticate, blockTimeSlot);
router.post('/slots/unblock', authenticate, unblockTimeSlot);

// Booking management
router.post('/bookings/:bookingId/cancel', authenticate, cancelBooking);
router.post('/bookings/:bookingId/confirm', authenticate, confirmBooking);

export default router;
