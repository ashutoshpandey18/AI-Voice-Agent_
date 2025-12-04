import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { csvExportService } from '../services/csvExportService';
import { pdfExportService } from '../services/pdfExportService';
import { BookingFilters } from '../types/admin';

/**
 * Admin Controller
 * Handles all admin dashboard HTTP requests
 */

/**
 * GET /api/admin/bookings
 * Get all bookings with filters and pagination
 */
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: BookingFilters = {
      search: req.query.search as string,
      status: req.query.status as string,
      cuisinePreference: req.query.cuisinePreference as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const result = await adminService.getBookings(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/bookings/:id
 * Get a single booking by ID
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await adminService.getBookingById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
};

/**
 * DELETE /api/admin/bookings/:id
 * Delete a booking by ID
 */
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await adminService.deleteBooking(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete booking',
      message: error.message
    });
  }
};

/**
 * PATCH /api/admin/bookings/:id/status
 * Update booking status
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status is required'
      });
      return;
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
      return;
    }

    const booking = await adminService.updateBookingStatus(id, status);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data
 */
export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await adminService.getAnalytics();

    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/cuisines
 * Get all unique cuisines
 */
export const getCuisines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cuisines = await adminService.getUniqueCuisines();

    res.json({
      success: true,
      data: cuisines
    });
  } catch (error: any) {
    console.error('Error fetching cuisines:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cuisines',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/export/csv
 * Export bookings to CSV
 */
export const exportCsv = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await adminService.getAllBookingsForExport();
    const csv = csvExportService.generateCsv(bookings);
    const filename = csvExportService.generateFilename();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/export/pdf
 * Export bookings report to PDF
 */
export const exportPdf = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [bookings, analytics] = await Promise.all([
      adminService.getAllBookingsForExport(),
      adminService.getAnalytics()
    ]);

    const doc = await pdfExportService.generatePdf(bookings, analytics);
    const filename = pdfExportService.generateFilename();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error: any) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export PDF',
      message: error.message
    });
  }
};
