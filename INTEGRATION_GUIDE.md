# 🔌 Quick Integration Guide - Connect Agent to New Services

This guide shows exactly where to add code in your existing `agentController.ts` to use the new services.

---

## Step 1: Import New Services

**Location:** Top of `backend/src/controllers/agentController.ts`

**Add these imports:**
```typescript
import conversationLogService from '../services/conversationLogService';
import timeSlotService from '../services/timeSlotService';
```

---

## Step 2: Start Conversation Logging

**Location:** Inside `handleAgentMessage` function, right after session creation

**Find this block:**
```typescript
// Get or create session
let session = sessions.get(sessionId);
if (!session) {
  session = {
    state: 'greeting' as ConversationState,
    slots: slots || {},
    location: location || process.env.DEFAULT_LOCATION || 'New York'
  };
  sessions.set(sessionId, session);
}
```

**Add after it:**
```typescript
// Start conversation logging (only once per session)
if (!session) {
  // ... existing session creation code ...

  // NEW: Start logging
  await conversationLogService.startConversation(sessionId, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip || req.connection.remoteAddress
  });
}
```

---

## Step 3: Log User Messages

**Location:** After extracting slots from message

**Find this block:**
```typescript
// Extract slots from current message
const extractionResult = slotManager.extractSlots(
  message,
  session.slots,
  session.state
);

// Update session with extracted information
session.slots = extractionResult.slots;
session.state = extractionResult.state;
```

**Add after it:**
```typescript
// NEW: Log user message
await conversationLogService.logUserMessage(
  sessionId,
  message,
  extractionResult.intent || 'unknown',
  extractionResult.confidence || 1.0,
  session.state
);
```

---

## Step 4: Check Availability Before Booking

**Location:** Before creating booking, add availability check

**Find this code (around line 125-140):**
```typescript
// Determine if we're ready to book
const missingSlots = slotManager.getMissingSlots(session.slots);

if (missingSlots.length === 0 && session.state === 'confirming') {
  // Ready to create booking
```

**Replace with:**
```typescript
// Determine if we're ready to book
const missingSlots = slotManager.getMissingSlots(session.slots);

if (missingSlots.length === 0 && session.state === 'confirming') {
  // NEW: Check availability before booking
  const isAvailable = await timeSlotService.checkAvailability(
    new Date(session.slots.bookingDate),
    session.slots.bookingTime,
    session.slots.numberOfGuests
  );

  if (!isAvailable) {
    // Find alternative slots
    const nearestSlots = await timeSlotService.findNearestAvailableSlots(
      new Date(session.slots.bookingDate),
      session.slots.bookingTime,
      session.slots.numberOfGuests,
      3
    );

    let responseText;
    if (nearestSlots.length > 0) {
      const slotOptions = nearestSlots.join(', ');
      responseText = toEnglishResponse(
        `I'm sorry, but ${session.slots.bookingTime} is fully booked. ` +
        `However, I have availability at ${slotOptions}. ` +
        `Would any of these times work for you?`
      );
    } else {
      responseText = toEnglishResponse(
        `I'm sorry, but we're fully booked for ${session.slots.bookingDate}. ` +
        `Would you like to try a different date?`
      );
    }

    // Log agent response
    await conversationLogService.logAgentResponse(
      sessionId,
      responseText,
      'availability_conflict'
    );

    const response: AgentMessageResponse = {
      response: responseText,
      state: 'collecting_time', // Go back to collecting time
      slots: session.slots,
      missingSlots: ['bookingTime'],
      readyToBook: false
    };

    res.json(response);
    return; // Exit early
  }

  // Continue with booking if available
  // Ready to create booking
```

---

## Step 5: Reserve Time Slot When Booking

**Location:** After successfully creating booking

**Find this block:**
```typescript
// Save booking to database
await newBooking.save();

console.log(`[Session ${sessionId}] Booking created successfully: ${bookingId}`);
```

**Add after it:**
```typescript
// NEW: Reserve time slot
const slotBookingResult = await timeSlotService.bookSlot(
  bookingDate,
  slots.bookingTime,
  slots.numberOfGuests,
  bookingId
);

if (!slotBookingResult.success) {
  console.error(`[Session ${sessionId}] Failed to reserve slot: ${slotBookingResult.message}`);
  // Note: Booking is created but slot reservation failed - handle this edge case
}
```

---

## Step 6: Log Agent Responses

**Location:** Before sending any response

**Find multiple places where you do:**
```typescript
res.json(response);
```

**Before each `res.json(response)`, add:**
```typescript
// Log agent response
await conversationLogService.logAgentResponse(
  sessionId,
  response.response,
  session.state
);

res.json(response);
```

---

## Step 7: Complete Conversation on Booking Success

**Location:** After booking is created and response is sent

**Find this block:**
```typescript
// Update session to done
session.state = 'done';

const response: AgentMessageResponse = {
  response: responseText,
  state: 'done',
  slots: session.slots,
  missingSlots: [],
  readyToBook: false
};

res.json(response);
```

**Replace with:**
```typescript
// Update session to done
session.state = 'done';

// NEW: Complete conversation logging
await conversationLogService.completeConversation(
  sessionId,
  bookingId,
  true, // booking was successful
  'done'
);

// Log final agent response
await conversationLogService.logAgentResponse(
  sessionId,
  responseText,
  'done'
);

const response: AgentMessageResponse = {
  response: responseText,
  state: 'done',
  slots: session.slots,
  missingSlots: [],
  readyToBook: false
};

res.json(response);
```

---

## Step 8: Handle Errors

**Location:** In the catch block at the end of `handleAgentMessage`

**Find this:**
```typescript
} catch (error: any) {
  console.error('Error handling agent message:', error);
  res.status(500).json({
    error: 'An error occurred processing your message. Please try again.'
  });
}
```

**Replace with:**
```typescript
} catch (error: any) {
  console.error('Error handling agent message:', error);

  // NEW: Log error in conversation
  await conversationLogService.errorConversation(
    req.body.sessionId,
    error.message
  );

  res.status(500).json({
    error: 'An error occurred processing your message. Please try again.'
  });
}
```

---

## Step 9: Handle Cancellations (Optional)

**Location:** Create a new endpoint for cancellations

**Add this function in `agentController.ts`:**
```typescript
/**
 * POST /api/agent/cancel
 * Cancel a booking and release the time slot
 */
export const handleCancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        error: 'Booking ID is required.'
      });
      return;
    }

    // Find booking
    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found.'
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        error: 'Booking is already cancelled.'
      });
      return;
    }

    // Release time slot
    await timeSlotService.releaseSlot(
      booking.bookingDate,
      booking.bookingTime,
      booking.numberOfGuests,
      booking.bookingId
    );

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully.'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking.'
    });
  }
};
```

**Add route in `agentRoutes.ts`:**
```typescript
router.post('/cancel', handleCancelBooking);
```

---

## Complete Modified Flow

```
User speaks → Frontend sends to /api/agent/message
    ↓
1. Create/get session
2. START conversation log (if new)
3. LOG user message
4. Extract slots
5. CHECK if slots complete
6. If complete: CHECK availability
    ↓
    If unavailable: FIND nearest slots → Suggest → RETURN
    If available: Continue
    ↓
7. Create booking
8. RESERVE time slot
9. LOG agent response
10. COMPLETE conversation log
11. Return success response
```

---

## Testing the Integration

### Test 1: Happy Path
```bash
# 1. Start conversation
curl -X POST http://localhost:5000/api/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "I want to book a table",
    "slots": {},
    "location": "New York"
  }'

# 2. Complete booking
# ... continue conversation ...

# 3. Check logs
curl -X GET http://localhost:5000/api/admin/dashboard/conversations/test-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Slot Conflict
```bash
# 1. Book first reservation for 7 PM
# ... complete booking ...

# 2. Try to book again at same time
curl -X POST http://localhost:5000/api/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-456",
    "message": "Book for tomorrow 7 PM",
    "slots": {
      "bookingDate": "2026-01-15",
      "bookingTime": "19:00",
      "numberOfGuests": 4
    }
  }'

# Should suggest alternative times
```

---

## Common Issues & Solutions

### Issue 1: Conversation not logging
**Symptom:** No entries in conversation log
**Solution:** Make sure `await conversationLogService.startConversation()` is called for new sessions

### Issue 2: Slots booking but showing as available
**Symptom:** Double bookings possible
**Solution:** Ensure `timeSlotService.bookSlot()` is called AFTER booking creation

### Issue 3: Cancellation not releasing slots
**Symptom:** Cancelled bookings still show as booked
**Solution:** Always call `timeSlotService.releaseSlot()` when cancelling

---

## Final Checklist

- [ ] Import conversation and timeslot services
- [ ] Start conversation logging on new session
- [ ] Log every user message
- [ ] Check availability before booking
- [ ] Suggest alternatives if unavailable
- [ ] Reserve slot on successful booking
- [ ] Log every agent response
- [ ] Complete conversation on success
- [ ] Handle errors with logging
- [ ] Test happy path
- [ ] Test slot conflicts
- [ ] Verify logs in admin dashboard

---

**Estimated Time:** 1-2 hours to integrate all changes

**Result:** Full conversation tracking + conflict prevention + observability

---

Need help? Check the examples in:
- `IMPLEMENTATION_GUIDE.md` - Architecture details
- `NEXT_STEPS.md` - Full project status
