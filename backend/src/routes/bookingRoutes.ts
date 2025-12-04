import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  deleteBooking,
  updateBookingStatus
} from '../controllers/bookingController';
import { generalLimiter, bookingLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * Booking Routes
 * Complete CRUD operations for restaurant bookings
 */

// Create a new booking (stricter rate limit)
router.post('/', bookingLimiter, createBooking);

// Get all bookings (with optional filters)
router.get('/', generalLimiter, getAllBookings);

// Get a single booking by ID
router.get('/:id', generalLimiter, getBookingById);

// Update booking status
router.patch('/:id', generalLimiter, updateBookingStatus);

// Delete a booking
router.delete('/:id', generalLimiter, deleteBooking);

export default router;
