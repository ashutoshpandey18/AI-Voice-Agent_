/**
 * API Service
 * Handles all communication with the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Ensure consistent base URL to prevent CORS issues
const normalizedApiUrl = API_URL.replace(/\/$/, ''); // Remove trailing slash

export interface ConversationSlots {
  customerName?: string;
  numberOfGuests?: number;
  bookingDate?: string;
  bookingTime?: string;
  cuisinePreference?: string;
  specialRequests?: string;
}

export interface AgentResponse {
  reply: string;
  slots: ConversationSlots;
  missing: string[];
  weather?: {
    condition: string;
    temperature: number;
    description: string;
  };
  seatingRecommendation?: 'indoor' | 'outdoor';
  readyToBook?: boolean;
}

export interface Booking {
  customerName: string;
  numberOfGuests: number;
  bookingDate: string;
  bookingTime: string;
  cuisinePreference: string;
  specialRequests?: string;
  seatingPreference: 'indoor' | 'outdoor';
  weatherInfo?: {
    condition: string;
    temperature: number;
    description: string;
  };
}

class ApiService {
  /**
   * Send message to agent
   */
  async sendMessage(
    sessionId: string,
    message: string,
    slots: ConversationSlots,
    location?: string
  ): Promise<AgentResponse> {
    const response = await fetch(`${normalizedApiUrl}/api/agent/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message,
        slots,
        location: location || 'New York'
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new booking
   */
  async createBooking(booking: Booking): Promise<any> {
    const response = await fetch(`${normalizedApiUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return response.json();
  }

  /**
   * Get all bookings
   */
  async getAllBookings(): Promise<any> {
    const response = await fetch(`${normalizedApiUrl}/api/bookings`);

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
