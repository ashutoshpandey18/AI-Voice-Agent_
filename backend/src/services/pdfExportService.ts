import PDFDocument from 'pdfkit';
import { IBooking } from '../models/Booking';
import { BookingAnalytics } from '../types/admin';

/**
 * PDF Export Service
 * Handles PDF generation for booking reports
 */
class PdfExportService {
  /**
   * Generate PDF report
   */
  async generatePdf(
    bookings: IBooking[],
    analytics: BookingAnalytics
  ): Promise<PDFKit.PDFDocument> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Restaurant Bookings Report',
        Author: 'AI Voice Agent System',
        Subject: 'Booking Analytics and Details'
      }
    });

    // Title
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Restaurant Bookings Report', { align: 'center' })
      .moveDown();

    // Date generated
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);

    // Summary Section
    this.addSummarySection(doc, analytics);

    // Add page break
    doc.addPage();

    // Recent Bookings Section
    this.addBookingsSection(doc, bookings.slice(0, 20)); // Top 20 recent bookings

    return doc;
  }

  /**
   * Add summary statistics section
   */
  private addSummarySection(doc: PDFKit.PDFDocument, analytics: BookingAnalytics): void {
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Summary Statistics', { underline: true })
      .moveDown();

    // Stats in a grid
    const stats = [
      { label: 'Total Bookings', value: analytics.totalBookings.toString() },
      { label: 'Top Cuisine', value: analytics.topCuisine },
      { label: 'Peak Hour', value: analytics.peakHour },
      { label: 'Avg Guests/Booking', value: analytics.averageGuestsPerBooking.toFixed(1) }
    ];

    const startY = doc.y;
    const columnWidth = 250;
    let currentY = startY;
    let currentX = 50;

    stats.forEach((stat, index) => {
      if (index % 2 === 0 && index > 0) {
        currentY += 60;
        currentX = 50;
      }

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(stat.label, currentX, currentY);

      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#3B82F6')
        .text(stat.value, currentX, currentY + 20);

      doc.fillColor('#000000'); // Reset color

      currentX += columnWidth;
    });

    doc.moveDown(5);

    // Cuisine Distribution
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Cuisine Distribution', { underline: true })
      .moveDown(0.5);

    analytics.cuisineDistribution.forEach(cuisine => {
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`• ${cuisine.cuisine}: ${cuisine.count} bookings (${cuisine.percentage}%)`, {
          indent: 20
        });
    });

    doc.moveDown(1.5);

    // Seating Preferences
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Seating Preferences', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`• Indoor: ${analytics.seatingPreferences.indoor} bookings`, { indent: 20 })
      .text(`• Outdoor: ${analytics.seatingPreferences.outdoor} bookings`, { indent: 20 });
  }

  /**
   * Add recent bookings table
   */
  private addBookingsSection(doc: PDFKit.PDFDocument, bookings: IBooking[]): void {
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Recent Bookings', { underline: true })
      .moveDown();

    if (bookings.length === 0) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .text('No bookings found.', { align: 'center' });
      return;
    }

    // Table headers
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 150;
    const col3X = 250;
    const col4X = 350;
    const col5X = 450;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Name', col1X, tableTop)
      .text('Guests', col2X, tableTop)
      .text('Date', col3X, tableTop)
      .text('Time', col4X, tableTop)
      .text('Cuisine', col5X, tableTop);

    // Draw line under headers
    doc
      .moveTo(col1X, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    let currentY = tableTop + 25;

    // Add booking rows
    bookings.forEach((booking, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const dateStr = new Date(booking.bookingDate).toLocaleDateString();

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(this.truncate(booking.customerName, 15), col1X, currentY)
        .text(booking.numberOfGuests.toString(), col2X, currentY)
        .text(dateStr, col3X, currentY)
        .text(booking.bookingTime, col4X, currentY)
        .text(this.truncate(booking.cuisinePreference, 12), col5X, currentY);

      currentY += 20;

      // Add separator line every 5 rows
      if ((index + 1) % 5 === 0 && index < bookings.length - 1) {
        doc
          .moveTo(col1X, currentY - 5)
          .lineTo(545, currentY - 5)
          .strokeOpacity(0.3)
          .stroke()
          .strokeOpacity(1);
      }
    });

    // Footer note
    doc.moveDown(2);
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        `Showing ${bookings.length} most recent bookings. For complete data, please use CSV export.`,
        { align: 'center' }
      );
  }

  /**
   * Truncate text to fit in cell
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `bookings-report-${dateStr}-${timeStr}.pdf`;
  }
}

export const pdfExportService = new PdfExportService();
