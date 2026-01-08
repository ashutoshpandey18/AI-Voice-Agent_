import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import conversationLogService from '../services/conversationLogService';
import timeSlotService from '../services/timeSlotService';
import { Booking } from '../models/Booking';

/**
 * Admin Dashboard Controller
 * Handles conversation logs, analytics, and slot management
 */

/**
 * Get conversation logs with pagination
 * GET /api/admin/conversations
 */
export const getConversationLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, limit = 50 } = req.query;

    let logs;
    if (status && typeof status === 'string') {
      logs = await conversationLogService.getConversationsByStatus(
        status as 'active' | 'completed' | 'abandoned' | 'error',
        parseInt(limit as string)
      );
    } else {
      logs = await conversationLogService.getRecentConversations(parseInt(limit as string));
    }

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('[Admin Dashboard] Error fetching conversation logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation logs.'
    });
  }
};

/**
 * Get a single conversation by session ID
 * GET /api/admin/conversations/:sessionId
 */
export const getConversationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const conversation = await conversationLogService.getConversation(sessionId);

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: 'Conversation not found.'
      });
      return;
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('[Admin Dashboard] Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation.'
    });
  }
};

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get conversation statistics
    const conversationStats = await conversationLogService.getStatistics();

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    // Get today's availability
    const today = new Date();
    const availabilityToday = await timeSlotService.getAvailabilitySummary(today);

    res.json({
      success: true,
      data: {
        conversations: conversationStats,
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          pending: pendingBookings
        },
        availabilityToday
      }
    });
  } catch (error) {
    console.error('[Admin Dashboard] Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics.'
    });
  }
};

/**
 * Get availability for a specific date
 * GET /api/admin/availability/:date
 */
export const getAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);

    const slots = await timeSlotService.getSlotsForDate(targetDate);
    const summary = await timeSlotService.getAvailabilitySummary(targetDate);

    res.json({
      success: true,
      data: {
        date: targetDate,
        summary,
        slots
      }
    });
  } catch (error) {
    console.error('[Admin Dashboard] Error fetching availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability.'
    });
  }
};

/**
 * Block a time slot
 * POST /api/admin/slots/block
 */
export const blockTimeSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated.'
      });
      return;
    }

    const { date, time, reason } = req.body;

    if (!date || !time) {
      res.status(400).json({
        success: false,
        error: 'Date and time are required.'
      });
      return;
    }

    const targetDate = new Date(date);
    const success = await timeSlotService.blockSlot(targetDate, time, req.admin.id, reason);

    if (success) {
      res.json({
        success: true,
        message: 'Time slot blocked successfully.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to block time slot.'
      });
    }
  } catch (error) {
    console.error('[Admin Dashboard] Error blocking slot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to block time slot.'
    });
  }
};

/**
 * Unblock a time slot
 * POST /api/admin/slots/unblock
 */
export const unblockTimeSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      res.status(400).json({
        success: false,
        error: 'Date and time are required.'
      });
      return;
    }

    const targetDate = new Date(date);
    const success = await timeSlotService.unblockSlot(targetDate, time);

    if (success) {
      res.json({
        success: true,
        message: 'Time slot unblocked successfully.'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Time slot not found.'
      });
    }
  } catch (error) {
    console.error('[Admin Dashboard] Error unblocking slot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unblock time slot.'
    });
  }
};

/**
 * Cancel a booking
 * POST /api/admin/bookings/:bookingId/cancel
 */
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found.'
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        error: 'Booking is already cancelled.'
      });
      return;
    }

    // Release time slot
    await timeSlotService.releaseSlot(
      booking.bookingDate,
      booking.bookingTime,
      booking.numberOfGuests,
      booking.bookingId
    );

    // Update booking status
    booking.status = 'cancelled';
    if (reason) {
      booking.specialRequests = `${booking.specialRequests || ''}\n[Admin Cancelled: ${reason}]`.trim();
    }
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking
    });
  } catch (error) {
    console.error('[Admin Dashboard] Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking.'
    });
  }
};

/**
 * Confirm a booking
 * POST /api/admin/bookings/:bookingId/confirm
 */
export const confirmBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found.'
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        error: 'Cannot confirm a cancelled booking.'
      });
      return;
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking confirmed successfully.',
      data: booking
    });
  } catch (error) {
    console.error('[Admin Dashboard] Error confirming booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm booking.'
    });
  }
};
