import { useState } from 'react';
import { downloadCsv, downloadPdf } from '../../hooks/useAdminApi';

/**
 * Export Page
 * Download reports in CSV and PDF formats
 */
export default function ExportPage() {
  const [csvDownloading, setCsvDownloading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const handleDownloadCsv = () => {
    setCsvDownloading(true);
    try {
      downloadCsv();
      setTimeout(() => setCsvDownloading(false), 2000);
    } catch (error) {
      alert('Failed to download CSV');
      setCsvDownloading(false);
    }
  };

  const handleDownloadPdf = () => {
    setPdfDownloading(true);
    try {
      downloadPdf();
      setTimeout(() => setPdfDownloading(false), 2000);
    } catch (error) {
      alert('Failed to download PDF');
      setPdfDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Export Booking Reports
        </h2>
        <p className="text-gray-600">
          Download comprehensive reports of all bookings in CSV or PDF format.
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-6">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            CSV Export
          </h3>
          <p className="text-gray-600 mb-6">
            Export all booking data to a CSV file. Perfect for importing into spreadsheet applications.
          </p>

          <div className="mb-6 text-sm text-gray-600">
            <p className="font-medium mb-2">Includes:</p>
            <ul className="space-y-1 ml-4">
              <li>• Booking ID</li>
              <li>• Customer Name</li>
              <li>• Date & Time</li>
              <li>• Number of Guests</li>
              <li>• Cuisine Preference</li>
              <li>• Seating Preference</li>
              <li>• Status</li>
              <li>• Special Requests</li>
            </ul>
          </div>

          <button
            onClick={handleDownloadCsv}
            disabled={csvDownloading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              csvDownloading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {csvDownloading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Downloading...
              </span>
            ) : (
              'Download CSV'
            )}
          </button>
        </div>

        {/* PDF Export */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6">
            <span className="text-4xl">📄</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            PDF Report
          </h3>
          <p className="text-gray-600 mb-6">
            Generate a formatted PDF report with analytics summary and recent bookings.
          </p>

          <div className="mb-6 text-sm text-gray-600">
            <p className="font-medium mb-2">Includes:</p>
            <ul className="space-y-1 ml-4">
              <li>• Summary Statistics</li>
              <li>• Total Bookings Count</li>
              <li>• Top Cuisine</li>
              <li>• Peak Hour Analysis</li>
              <li>• Cuisine Distribution</li>
              <li>• Seating Preferences</li>
              <li>• Recent Bookings Table</li>
            </ul>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={pdfDownloading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              pdfDownloading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {pdfDownloading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              'Download PDF'
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6 mt-6 border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-2">💡 Tips</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            <strong>CSV:</strong> Best for data analysis in Excel, Google Sheets, or database imports.
          </li>
          <li>
            <strong>PDF:</strong> Ideal for reports, presentations, or sharing with stakeholders.
          </li>
          <li>
            <strong>Updates:</strong> Both formats include real-time data at the moment of export.
          </li>
        </ul>
      </div>
    </div>
  );
}
