import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { v4 as uuidv4 } from 'uuid';

/**
 * Booking Controller
 * Handles CRUD operations for restaurant bookings
 */

/**
 * POST /api/bookings
 * Create a new booking
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      seatingPreference,
      weatherInfo
    } = req.body;

    // Validate required fields
    if (!customerName || !numberOfGuests || !bookingDate || !bookingTime || !cuisinePreference || !seatingPreference) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['customerName', 'numberOfGuests', 'bookingDate', 'bookingTime', 'cuisinePreference', 'seatingPreference']
      });
      return;
    }

    // Validate number of guests
    if (numberOfGuests < 1 || numberOfGuests > 20) {
      res.status(400).json({
        error: 'Number of guests must be between 1 and 20'
      });
      return;
    }

    // Validate seating preference
    if (!['indoor', 'outdoor'].includes(seatingPreference)) {
      res.status(400).json({
        error: 'Seating preference must be either "indoor" or "outdoor"'
      });
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(bookingTime)) {
      res.status(400).json({
        error: 'Invalid time format. Use HH:MM (e.g., 19:00)'
      });
      return;
    }

    // Create booking
    const booking = new Booking({
      bookingId: uuidv4(),
      customerName,
      numberOfGuests,
      bookingDate: new Date(bookingDate),
      bookingTime,
      cuisinePreference,
      specialRequests: specialRequests || '',
      weatherInfo: weatherInfo || null,
      seatingPreference,
      status: 'confirmed',
      createdAt: new Date()
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });

  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error.message
    });
  }
};

/**
 * GET /api/bookings
 * Get all bookings with optional filters
 */
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, customerName, date } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }

    if (date) {
      const searchDate = new Date(date as string);
      const nextDay = new Date(searchDate);
      nextDay.setDate(searchDate.getDate() + 1);

      filter.bookingDate = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    // Fetch bookings
    const bookings = await Booking.find(filter)
      .sort({ bookingDate: 1, bookingTime: 1 })
      .limit(100);

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
};

/**
 * GET /api/bookings/:id
 * Get a single booking by ID
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Try to find by MongoDB _id or bookingId
    const booking = await Booking.findOne({
      $or: [
        { _id: id },
        { bookingId: id }
      ]
    });

    if (!booking) {
      res.status(404).json({
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      booking
    });

  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
};

/**
 * DELETE /api/bookings/:id
 * Delete a booking by ID
 */
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Try to find and delete by MongoDB _id or bookingId
    const booking = await Booking.findOneAndDelete({
      $or: [
        { _id: id },
        { bookingId: id }
      ]
    });

    if (!booking) {
      res.status(404).json({
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully',
      booking
    });

  } catch (error: any) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      error: 'Failed to delete booking',
      message: error.message
    });
  }
};

/**
 * PATCH /api/bookings/:id
 * Update booking status (optional - for future enhancement)
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      res.status(400).json({
        error: 'Invalid status. Must be: pending, confirmed, or cancelled'
      });
      return;
    }

    const booking = await Booking.findOneAndUpdate(
      {
        $or: [
          { _id: id },
          { bookingId: id }
        ]
      },
      { status },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error: any) {
    console.error('Update booking error:', error);
    res.status(500).json({
      error: 'Failed to update booking',
      message: error.message
    });
  }
};
