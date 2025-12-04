import { ConversationSlots, ConversationState, SlotExtractionResult } from '../types';
import {
  extractBilingualNumber,
  extractBilingualDate,
  extractBilingualTime,
  extractBilingualCuisine,
  extractBilingualSpecialRequests,
  formatDate
} from '../utils/bilingualNLP';

/**
 * Slot Manager Service
 * Implements deterministic slot-filling conversation logic with bilingual support
 * Supports Hindi + English with code-switching
 * Extracts information from user messages and manages conversation state
 */
class SlotManager {
  // Required slots for a complete booking
  private readonly requiredSlots = [
    'customerName',
    'numberOfGuests',
    'bookingDate',
    'bookingTime',
    'cuisinePreference'
  ];

  /**
   * Extract slot values from user message using pattern matching
   * This is a deterministic approach without LLM involvement
   */
  extractSlots(message: string, currentSlots: ConversationSlots, currentState: ConversationState): SlotExtractionResult {
    const normalizedMessage = message.toLowerCase().trim();
    const updatedSlots = { ...currentSlots };
    let newState = currentState;
    let slotWasExtracted = false;

    // Extract customer name
    if (!updatedSlots.customerName && (currentState === 'greeting' || currentState === 'collecting_name')) {
      const nameMatch = this.extractName(normalizedMessage, currentState);
      if (nameMatch) {
        updatedSlots.customerName = nameMatch;
        slotWasExtracted = true;
      }
    }

    // Extract number of guests
    if (!updatedSlots.numberOfGuests && currentState === 'collecting_guests') {
      const guestsMatch = this.extractNumberOfGuests(normalizedMessage);
      if (guestsMatch) {
        updatedSlots.numberOfGuests = guestsMatch;
        slotWasExtracted = true;
      }
    }

    // Extract booking date
    if (!updatedSlots.bookingDate && currentState === 'collecting_date') {
      const dateMatch = this.extractDate(normalizedMessage);
      if (dateMatch) {
        updatedSlots.bookingDate = dateMatch;
        slotWasExtracted = true;
      }
    }

    // Extract booking time
    if (!updatedSlots.bookingTime && currentState === 'collecting_time') {
      const timeMatch = this.extractTime(normalizedMessage);
      if (timeMatch) {
        updatedSlots.bookingTime = timeMatch;
        slotWasExtracted = true;
      }
    }

    // Extract cuisine preference
    if (!updatedSlots.cuisinePreference && currentState === 'collecting_cuisine') {
      const cuisineMatch = this.extractCuisine(normalizedMessage);
      if (cuisineMatch) {
        updatedSlots.cuisinePreference = cuisineMatch;
        slotWasExtracted = true;
      }
    }

    // Extract special requests (optional - can happen at any time)
    const specialRequestMatch = this.extractSpecialRequests(normalizedMessage);
    if (specialRequestMatch && !updatedSlots.specialRequests) {
      updatedSlots.specialRequests = specialRequestMatch;
    }

    // Advance state based on filled slots
    newState = this.determineNextState(updatedSlots, currentState, slotWasExtracted);

    return {
      slots: updatedSlots,
      state: newState
    };
  }

  /**
   * Determine the next conversation state based on filled slots
   */
  private determineNextState(slots: ConversationSlots, _currentState: ConversationState, _slotWasExtracted: boolean): ConversationState {
    // Check all required slots
    const hasName = !!slots.customerName;
    const hasGuests = !!slots.numberOfGuests;
    const hasDate = !!slots.bookingDate;
    const hasTime = !!slots.bookingTime;
    const hasCuisine = !!slots.cuisinePreference;

    // State progression logic
    if (!hasName) {
      return 'collecting_name';
    }
    if (!hasGuests) {
      return 'collecting_guests';
    }
    if (!hasDate) {
      return 'collecting_date';
    }
    if (!hasTime) {
      return 'collecting_time';
    }
    if (!hasCuisine) {
      return 'collecting_cuisine';
    }

    // All slots filled - move to weather fetch
    if (hasName && hasGuests && hasDate && hasTime && hasCuisine) {
      return 'fetching_weather';
    }

    // Fallback - shouldn't reach here but return current state if we do
    return _currentState;
  }

  /**
   * Extract customer name from message
   */
  private extractName(message: string, state: ConversationState): string | null {
    // Only extract name when in appropriate state
    if (state !== 'collecting_name' && state !== 'greeting') {
      return null;
    }

    // Pattern: "my name is X", "I'm X", "this is X", "call me X"
    const patterns = [
      /(?:my name is|i'm|i am|this is|call me)\s+([a-z]+(?:\s+[a-z]+)?)/i,
      /^([a-z]+(?:\s+[a-z]+)?)$/i // Just a name by itself
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        // Capitalize first letter of each word
        return match[1]
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    return null;
  }

  /**
   * Extract number of guests from message
   * Supports Hindi + English bilingual input with code-switching
   * Examples: "5 log", "paanch people", "hum 4 honge", "maybe teen", "me and 4 more"
   */
  private extractNumberOfGuests(message: string): number | null {
    return extractBilingualNumber(message);
  }

  /**
   * Extract date from message
   * Supports Hindi + English bilingual input with code-switching
   * Examples: "aaj", "kal", "parso", "Friday", "Somvar", "kal shaam", "next Friday", "12 March"
   */
  private extractDate(message: string): string | null {
    const date = extractBilingualDate(message);
    return date ? formatDate(date) : null;
  }

  /**
   * Extract time from message
   * Supports Hindi + English bilingual input with code-switching
   * Examples: "7 baje", "shaam 7", "raat 9", "evening 7", "at 7", "19:00", "dopahar 2"
   */
  private extractTime(message: string): string | null {
    return extractBilingualTime(message);
  }

  /**
   * Extract cuisine preference from message
   * Supports Hindi + English bilingual input with code-switching
   * Examples: "Italian chahiye", "chini khana", "Chinese food", "pasta", "biryani"
   */
  private extractCuisine(message: string): string | null {
    return extractBilingualCuisine(message);
  }

  /**
   * Extract special requests from message
   * Supports Hindi + English bilingual input with code-switching
   * Examples: "birthday hai", "bachche honge", "anniversary", "shakahari", "elerji"
   */
  private extractSpecialRequests(message: string): string | null {
    const requests = extractBilingualSpecialRequests(message);
    return requests.length > 0 ? requests.join(', ') : null;
  }

  /**
   * Get missing required slots
   */
  getMissingSlots(slots: ConversationSlots): string[] {
    const missing: string[] = [];

    for (const slotName of this.requiredSlots) {
      if (!slots[slotName as keyof ConversationSlots]) {
        missing.push(slotName);
      }
    }

    return missing;
  }

  /**
   * Check if all required slots are filled
   */
  areAllSlotsFilledExceptOptional(slots: ConversationSlots): boolean {
    return this.getMissingSlots(slots).length === 0;
  }

  /**
   * Generate appropriate response based on current state and missing slots
   * ALWAYS returns clean English-only responses
   * Hindi input is understood via extraction functions, but output is ALWAYS English
   */
  generateResponse(state: ConversationState, slots: ConversationSlots): string {
    const missing = this.getMissingSlots(slots);

    switch (state) {
      case 'greeting':
        return "Hello! I'd be happy to help you book a table. May I have your name, please?";

      case 'collecting_name':
        return "May I have your name, please?";

      case 'collecting_guests':
        return `Thank you, ${slots.customerName}! How many guests will be joining you?`;

      case 'collecting_date':
        return "What date would you like to book for? You can say today, tomorrow, or any specific day.";

      case 'collecting_time':
        return "What time would you prefer? You can say times like 7 PM, 8 o'clock, or evening.";

      case 'collecting_cuisine':
        return "What type of cuisine would you like? We offer Italian, Chinese, Japanese, Indian, and more.";

      case 'confirming':
        return "Would you like to confirm this booking?";

      case 'completed':
        return "Great! Your booking has been confirmed. We look forward to seeing you!";

      default:
        if (missing.length > 0) {
          return `I still need to know: ${this.formatMissingSlots(missing)}.`;
        }
        return "Let me process your booking.";
    }
  }

  /**
   * Helper: Format missing slots for user-friendly message
   */
  private formatMissingSlots(missing: string[]): string {
    const formatted = missing.map(slot => {
      switch (slot) {
        case 'customerName': return 'your name';
        case 'numberOfGuests': return 'number of guests';
        case 'bookingDate': return 'booking date';
        case 'bookingTime': return 'preferred time';
        case 'cuisinePreference': return 'cuisine preference';
        default: return slot;
      }
    });

    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
    return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
  }

  // Note: Helper methods (formatDate, getDayOfWeek, getNextDayOfWeek, parseDateMatch, parseTimeMatch)
  // are now handled by the bilingual NLP utility module
}

export const slotManager = new SlotManager();
