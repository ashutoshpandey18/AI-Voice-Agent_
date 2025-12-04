import { Booking, IBooking } from '../models/Booking';
import {
  BookingAnalytics,
  BookingFilters,
  PaginatedBookings,
  PeakHourData,
  CuisineData,
  DailyTrendData
} from '../types/admin';

/**
 * Admin Service
 * Handles all admin dashboard operations including analytics and bookings management
 */
class AdminService {
  /**
   * Get all bookings with filters and pagination
   */
  async getBookings(filters: BookingFilters): Promise<PaginatedBookings> {
    const {
      search = '',
      status,
      cuisinePreference,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10
    } = filters;

    // Build query object
    const query: any = {};

    // Search filter (customer name)
    if (search) {
      query.customerName = { $regex: search, $options: 'i' };
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Cuisine filter
    if (cuisinePreference && cuisinePreference !== 'all') {
      query.cuisinePreference = cuisinePreference;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.bookingDate = {};
      if (dateFrom) {
        query.bookingDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.bookingDate.$lte = new Date(dateTo);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      bookings,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Get comprehensive analytics data
   */
  async getAnalytics(): Promise<BookingAnalytics> {
    const [
      totalBookings,
      peakHours,
      cuisineDistribution,
      dailyTrends,
      seatingPreferences,
      avgGuests
    ] = await Promise.all([
      this.getTotalBookings(),
      this.getPeakHours(),
      this.getCuisineDistribution(),
      this.getDailyTrends(),
      this.getSeatingPreferences(),
      this.getAverageGuestsPerBooking()
    ]);

    // Determine top cuisine
    const topCuisine = cuisineDistribution.length > 0
      ? cuisineDistribution[0].cuisine
      : 'N/A';

    // Determine peak hour
    const peakHourData = peakHours.length > 0
      ? peakHours.reduce((max, curr) => curr.count > max.count ? curr : max)
      : { hour: 0, count: 0, label: 'N/A' };

    const peakHour = peakHourData.label;

    return {
      totalBookings,
      peakHours,
      cuisineDistribution,
      dailyTrends,
      seatingPreferences,
      topCuisine,
      peakHour,
      averageGuestsPerBooking: avgGuests
    };
  }

  /**
   * Get total number of bookings
   */
  private async getTotalBookings(): Promise<number> {
    return await Booking.countDocuments();
  }

  /**
   * Get peak hours using MongoDB aggregation
   */
  private async getPeakHours(): Promise<PeakHourData[]> {
    const results = await Booking.aggregate([
      {
        $project: {
          hour: {
            $hour: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
                    'T',
                    '$bookingTime',
                    ':00.000Z'
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Convert to PeakHourData format
    const peakHours: PeakHourData[] = results.map(item => ({
      hour: item._id,
      count: item.count,
      label: this.formatHourLabel(item._id)
    }));

    // Fill missing hours with 0 count (for complete chart data)
    const allHours: PeakHourData[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const existing = peakHours.find(p => p.hour === hour);
      allHours.push(existing || {
        hour,
        count: 0,
        label: this.formatHourLabel(hour)
      });
    }

    return allHours;
  }

  /**
   * Get cuisine distribution
   */
  private async getCuisineDistribution(): Promise<CuisineData[]> {
    const results = await Booking.aggregate([
      {
        $group: {
          _id: '$cuisinePreference',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const total = results.reduce((sum, item) => sum + item.count, 0);

    return results.map(item => ({
      cuisine: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  }

  /**
   * Get daily booking trends for the last 30 days
   */
  private async getDailyTrends(): Promise<DailyTrendData[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const results = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill missing dates with 0 count
    const dailyTrends: DailyTrendData[] = [];
    const currentDate = new Date(thirtyDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = results.find(r => r._id === dateStr);

      dailyTrends.push({
        date: dateStr,
        count: existing ? existing.count : 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyTrends;
  }

  /**
   * Get seating preferences distribution
   */
  private async getSeatingPreferences() {
    const results = await Booking.aggregate([
      {
        $group: {
          _id: '$seatingPreference',
          count: { $sum: 1 }
        }
      }
    ]);

    const indoor = results.find(r => r._id === 'indoor')?.count || 0;
    const outdoor = results.find(r => r._id === 'outdoor')?.count || 0;

    return { indoor, outdoor };
  }

  /**
   * Get average guests per booking
   */
  private async getAverageGuestsPerBooking(): Promise<number> {
    const result = await Booking.aggregate([
      {
        $group: {
          _id: null,
          avgGuests: { $avg: '$numberOfGuests' }
        }
      }
    ]);

    return result.length > 0 ? Math.round(result[0].avgGuests * 10) / 10 : 0;
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<IBooking | null> {
    return await Booking.findById(id);
  }

  /**
   * Delete a booking by ID
   */
  async deleteBooking(id: string): Promise<boolean> {
    const result = await Booking.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
  }

  /**
   * Get all unique cuisines
   */
  async getUniqueCuisines(): Promise<string[]> {
    return await Booking.distinct('cuisinePreference');
  }

  /**
   * Format hour to readable label
   */
  private formatHourLabel(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  /**
   * Get all bookings for export (no pagination)
   */
  async getAllBookingsForExport(): Promise<any[]> {
    return await Booking.find()
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const adminService = new AdminService();
