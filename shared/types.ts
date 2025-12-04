/**
 * Shared TypeScript types used across frontend and backend
 */

// ============================================
// BOOKING TYPES
// ============================================

export interface Booking {
  _id?: string;
  bookingId: string;
  customerName: string;
  numberOfGuests: number;
  bookingDate: Date;
  bookingTime: string;
  cuisinePreference: string;
  specialRequests?: string;
  weatherInfo?: WeatherInfo;
  seatingPreference: 'indoor' | 'outdoor';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface CreateBookingRequest {
  customerName: string;
  numberOfGuests: number;
  bookingDate: string;
  bookingTime: string;
  cuisinePreference: string;
  specialRequests?: string;
  seatingPreference: 'indoor' | 'outdoor';
}

// ============================================
// AGENT CONVERSATION TYPES
// ============================================

export interface AgentMessageRequest {
  sessionId: string;
  message: string;
  slots: ConversationSlots;
  location?: string;
}

export interface AgentMessageResponse {
  reply: string;
  slots: ConversationSlots;
  missing: string[];
  weather?: WeatherInfo;
  seatingRecommendation?: 'indoor' | 'outdoor';
  readyToBook?: boolean;
}

export interface ConversationSlots {
  customerName?: string;
  numberOfGuests?: number;
  bookingDate?: string;
  bookingTime?: string;
  cuisinePreference?: string;
  specialRequests?: string;
}

// ============================================
// WEATHER TYPES
// ============================================

export interface WeatherInfo {
  condition: string;
  temperature: number;
  description: string;
  humidity?: number;
  windSpeed?: number;
}

export interface WeatherRecommendation {
  weather: WeatherInfo;
  recommendation: 'indoor' | 'outdoor';
  reason: string;
}

// ============================================
// SESSION TYPES
// ============================================

export interface ConversationSession {
  sessionId: string;
  slots: ConversationSlots;
  state: ConversationState;
  createdAt: Date;
  lastUpdated: Date;
}

export type ConversationState =
  | 'greeting'
  | 'collecting_name'
  | 'collecting_guests'
  | 'collecting_date'
  | 'collecting_time'
  | 'collecting_cuisine'
  | 'fetching_weather'
  | 'suggesting_seating'
  | 'confirming'
  | 'completed';

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
