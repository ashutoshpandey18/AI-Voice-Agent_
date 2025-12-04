/**
 * Admin Dashboard Type Definitions
 */

export interface BookingAnalytics {
  totalBookings: number;
  peakHours: PeakHourData[];
  cuisineDistribution: CuisineData[];
  dailyTrends: DailyTrendData[];
  seatingPreferences: SeatingData;
  topCuisine: string;
  peakHour: string;
  averageGuestsPerBooking: number;
}

export interface PeakHourData {
  hour: number;
  count: number;
  label: string;
}

export interface CuisineData {
  cuisine: string;
  count: number;
  percentage: number;
}

export interface DailyTrendData {
  date: string;
  count: number;
}

export interface SeatingData {
  indoor: number;
  outdoor: number;
}

export interface BookingFilters {
  search?: string;
  status?: string;
  cuisinePreference?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBookings {
  bookings: any[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
