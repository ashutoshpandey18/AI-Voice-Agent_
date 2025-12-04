import { IBooking } from '../models/Booking';

/**
 * CSV Export Service
 * Handles CSV generation for booking data
 */
class CsvExportService {
  /**
   * Convert bookings to CSV format
   */
  generateCsv(bookings: IBooking[]): string {
    // CSV Headers
    const headers = [
      'Booking ID',
      'Customer Name',
      'Number of Guests',
      'Booking Date',
      'Booking Time',
      'Cuisine Preference',
      'Seating Preference',
      'Special Requests',
      'Status',
      'Created At'
    ];

    // Create header row
    const csvRows: string[] = [headers.join(',')];

    // Add data rows
    for (const booking of bookings) {
      const row = [
        this.escapeCsvValue(booking.bookingId || booking._id?.toString() || ''),
        this.escapeCsvValue(booking.customerName),
        booking.numberOfGuests.toString(),
        this.formatDate(booking.bookingDate),
        booking.bookingTime,
        this.escapeCsvValue(booking.cuisinePreference),
        booking.seatingPreference,
        this.escapeCsvValue(booking.specialRequests || ''),
        booking.status,
        this.formatDateTime(booking.createdAt)
      ];

      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Escape CSV values that contain commas, quotes, or newlines
   */
  private escapeCsvValue(value: string): string {
    if (!value) return '';

    // Check if value contains special characters
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // Escape double quotes by doubling them
      const escaped = value.replace(/"/g, '""');
      // Wrap in double quotes
      return `"${escaped}"`;
    }

    return value;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format datetime to YYYY-MM-DD HH:MM:SS
   */
  private formatDateTime(date: Date): string {
    const d = new Date(date);
    const dateStr = this.formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `bookings-export-${dateStr}-${timeStr}.csv`;
  }
}

export const csvExportService = new CsvExportService();
