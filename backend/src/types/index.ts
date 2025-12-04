/**
 * TypeScript type definitions for the backend
 */

export interface ConversationSlots {
  customerName?: string;
  numberOfGuests?: number;
  bookingDate?: string;
  bookingTime?: string;
  cuisinePreference?: string;
  specialRequests?: string;
}

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

export interface SlotExtractionResult {
  slots: ConversationSlots;
  state: ConversationState;
}
