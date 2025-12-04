import { Request, Response } from 'express';
import { AgentMessageRequest, AgentMessageResponse, ConversationState } from '../types';
import { slotManager } from '../services/slotManager';
import { weatherService } from '../services/weatherService';
import { toEnglishResponse } from '../utils/responseFormatter';

/**
 * Agent Controller
 * Handles conversation orchestration and slot-filling logic
 * This is the brain of the voice agent system
 *
 * IMPORTANT: All agent responses are sanitized to English-only via toEnglishResponse()
 * Hindi/Hinglish input is understood, but output is ALWAYS clean English
 */

// In-memory session storage (use Redis in production)
interface Session {
  state: ConversationState;
  slots: any;
  location: string;
}

const sessions = new Map<string, Session>();

/**
 * POST /api/agent/message
 * Main endpoint for conversation handling
 */
export const handleAgentMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, message, slots, location } = req.body as AgentMessageRequest;

    // Validate request
    if (!sessionId || !message) {
      res.status(400).json({
        error: 'Missing required fields: sessionId and message are required'
      });
      return;
    }

    // Get or create session
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        state: 'greeting' as ConversationState,
        slots: slots || {},
        location: location || process.env.DEFAULT_LOCATION || 'New York'
      };
      sessions.set(sessionId, session);
    } else {
      // Update session with any new slots from frontend
      session.slots = { ...session.slots, ...slots };
      if (location) {
        session.location = location;
      }
    }

    // Log current state for debugging
    console.log(`[Session ${sessionId}] Current state: ${session.state}`);
    console.log(`[Session ${sessionId}] Current slots:`, JSON.stringify(session.slots));
    console.log(`[Session ${sessionId}] User message: ${message}`);

    // Extract slots from current message
    const extractionResult = slotManager.extractSlots(
      message,
      session.slots,
      session.state
    );

    // Update session with extracted information
    session.slots = extractionResult.slots;
    session.state = extractionResult.state;

    // Log updated state
    console.log(`[Session ${sessionId}] New state: ${session.state}`);
    console.log(`[Session ${sessionId}] Updated slots:`, JSON.stringify(session.slots));

    // Check if we need to fetch weather
    let weatherRecommendation = null;
    let seatingRecommendation: 'indoor' | 'outdoor' | undefined = undefined;

    if (session.state === 'fetching_weather' && session.slots.bookingDate) {
      try {
        const bookingDate = new Date(session.slots.bookingDate);
        weatherRecommendation = await weatherService.getWeatherRecommendation(
          session.location,
          bookingDate
        );

        seatingRecommendation = weatherRecommendation.recommendation;
        session.state = 'suggesting_seating';
      } catch (error) {
        console.error('Weather fetch error:', error);
        // Continue without weather data
        session.state = 'confirming';
      }
    }

    // Determine if we're ready to book
    const missingSlots = slotManager.getMissingSlots(session.slots);
    const readyToBook = missingSlots.length === 0 && session.state === 'suggesting_seating';

    // Generate appropriate response (raw response, may contain Hindi if slotManager had legacy data)
    let rawReply = '';

    if (session.state === 'greeting') {
      rawReply = slotManager.generateResponse('greeting', session.slots);
      session.state = 'collecting_name';
    } else if (session.state === 'suggesting_seating' && weatherRecommendation) {
      rawReply = `Perfect! I've checked the weather for ${session.slots.bookingDate}. ${weatherRecommendation.reason} Would you like to proceed with ${seatingRecommendation} seating?`;
      session.state = 'confirming';
    } else if (readyToBook) {
      rawReply = "All set! Please click the 'Confirm Booking' button to finalize your reservation.";
    } else {
      rawReply = slotManager.generateResponse(session.state, session.slots);
    }

    // CRITICAL: Sanitize response to ensure English-only output
    const reply = toEnglishResponse(rawReply, session.state);

    console.log(`[Session ${sessionId}] Raw reply: ${rawReply}`);
    console.log(`[Session ${sessionId}] Sanitized reply: ${reply}`);

    // Prepare response
    const response: AgentMessageResponse = {
      reply,
      slots: session.slots,
      missing: missingSlots,
      weather: weatherRecommendation?.weather,
      seatingRecommendation,
      readyToBook
    };

    res.json(response);

  } catch (error: any) {
    console.error('Agent error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Clear session (optional endpoint for debugging)
 */
export const clearSession = (req: Request, res: Response): void => {
  const { sessionId } = req.params;

  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    res.json({ message: 'Session cleared successfully' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
};

/**
 * Get session status (optional endpoint for debugging)
 */
export const getSessionStatus = (req: Request, res: Response): void => {
  const { sessionId } = req.params;

  const session = sessions.get(sessionId);

  if (session) {
    res.json(session);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
};
