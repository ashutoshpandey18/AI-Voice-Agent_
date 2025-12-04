# AI Voice Restaurant Booking Agent

I built this because I wanted to understand how voice agents actually work without using paid APIs or relying on LLMs. It's a full-stack MERN application where you talk to book a table, and there's an admin panel to manage everything.

The voice agent walks you through a conversation, collects booking details (name, guests, date, time, cuisine), checks the weather to suggest seating, and saves it to MongoDB. Plus there's a complete admin dashboard with charts and export tools.

Building this taught me a lot about browser speech APIs, state machines, handling async operations, and making systems that don't break when APIs fail.

---

## What It Does

**Voice Booking**: You click once, then just talk. The agent asks questions, you answer naturally, it reads everything back, and your booking is saved.

**Weather Integration**: It actually fetches the forecast and suggests indoor/outdoor seating based on temperature and weather conditions.

**Admin Dashboard**: View all bookings, search and filter them, see analytics (peak hours, popular cuisines, trends), export to CSV/PDF.

**Rule-Based NLP**: No paid APIs. I built simple extractors for numbers (including Hindi words like "do", "teen"), dates ("tomorrow", "next Monday"), times ("dinner time", "7 PM"), and cuisines.

---

## How It Works

```
User speaks → Frontend (Web Speech API) → Backend (Express)
                                              ↓
                                        State Machine
                                        (9 conversation states)
                                              ↓
                                        NLP Extraction
                                        (regex + dictionaries)
                                              ↓
                                        Weather Check
                                        (OpenWeatherMap)
                                              ↓
                                        Save to MongoDB
                                              ↓
                                        TTS reads confirmation
```

The frontend is basically just a mic button and transcript display. All the logic lives in the backend. This kept things simple and made debugging way easier.

---

## Tech Stack

**Why I chose these:**

- **React + Vite**: I wanted fast dev experience. Vite HMR is instant compared to Create React App.
- **Web Speech API**: Free, built into browsers, no server processing needed. Yeah it only works in Chrome/Edge, but that covers most users.
- **Express + Node**: I already know it well, and it gives me full control over the API.
- **TypeScript**: Catches bugs before I even run the code. Shared types between frontend/backend saved me tons of time.
- **MongoDB**: Flexible schema. I changed the booking model like 5 times during development, would've been annoying with SQL.
- **State Machine**: Deterministic. I know exactly what state the conversation is in, makes debugging trivial.
- **Rule-Based NLP**: I didn't want to pay for API calls or deal with unpredictable LLM responses. Regex is fast (5ms) and reliable.

---

## Main Features

**Voice Agent:**
- Single-click start, then fully automated
- Collects: name, guest count, date, time, cuisine, special requests
- Fetches weather and suggests seating
- Reads back full booking for confirmation
- Handles incomplete answers and errors

**Admin Dashboard:**
- Bookings table (search, filter, sort, delete)
- Analytics charts (Recharts):
  - Peak booking hours (bar chart)
  - Popular cuisines (pie chart)
  - Daily trends (line chart)
- Export bookings as CSV or PDF

**Backend:**
- 9-state conversation state machine
- Rate limiting (different limits for different endpoints)
- MongoDB aggregation pipelines for analytics
- Weather caching and graceful degradation

---

## Project Structure

```
backend/
  ├── controllers/     # Route handlers
  ├── services/        # Business logic (agent, weather, booking, admin, export)
  ├── models/          # Mongoose schemas
  ├── middleware/      # Rate limiting, CORS
  ├── routes/          # API routes
  └── types/           # TypeScript interfaces

frontend/
  ├── components/      # Reusable UI
  ├── pages/           # Voice agent page + admin dashboard (5 pages)
  ├── hooks/           # React Query hooks for API calls
  └── services/        # Speech service (STT/TTS) + API service (Axios)
```

I separated business logic into services. This made it way easier to test functions without spinning up the whole Express server.

---

## Important Code Decisions

### 1. State Machine for Conversations

I use a simple switch statement that moves through states:

```
greeting → collecting_name → collecting_guests → collecting_date
→ collecting_time → collecting_cuisine → collecting_requests
→ fetching_weather → confirm_booking → completed
```

Each state knows what to extract from the user's message. If extraction fails, stay in the same state and ask again.

**Why this works**: Guaranteed forward progress. Users can't skip required fields. Debugging is easy because I can just log the current state.

### 2. Single Global SpeechRecognition Instance

Initially I was creating a new recognition object every time. Bad idea. This caused memory leaks and weird timing bugs.

```typescript
// Good - create once
const recognition = new window.webkitSpeechRecognition();
recognition.continuous = false;

// Then just call .start() when needed
```

### 3. Preventing TTS/STT Overlap

This was the hardest part. If speech synthesis is still talking and recognition starts, the browser throws errors.

My solution:
- `isSpeaking` flag tracks TTS state
- Before speaking: abort recognition, cancel any pending speech, wait 200ms
- After speaking ends: wait 500ms, double-check flags, then restart recognition
- If STT tries to start while TTS is active: block it

These delays feel like hacks but they're necessary. Browser APIs aren't instant.

### 4. Reading the Right Transcript

When `continuous: false`, each recognition session adds to `event.results`. If you always read `[0]`, you keep getting the same old result.

```typescript
// Wrong
const transcript = event.results[0][0].transcript;

// Correct
const transcript = event.results[event.resultIndex][0].transcript;
```

This bug took me 2 hours to find. Empty messages were being sent to the backend and I couldn't figure out why.

### 5. Why Rule-Based NLP

I could've used ChatGPT API, but:
- **Cost**: $0 vs cents per request (adds up fast)
- **Speed**: 5ms vs 500-2000ms
- **Reliability**: Same input always gives same output
- **Control**: I can trace exactly which regex matched

Trade-off: Less flexible with weird phrasings. But I just add more synonyms when users report issues.

---

## Biggest Challenges

### 1. Speech Recognition Breaking

**Problem**: Sometimes recognition would just stop listening and I'd get "Sorry, I encountered an error" responses.

**What I found**:
- I was reading `event.results[0]` instead of `event.results[event.resultIndex]`
- The `onspeechend` and `onnomatch` handlers were firing incorrectly and stopping recognition early

**Fix**: Use correct result index, remove problematic event handlers, add empty string checks before sending to backend.

### 2. TTS "Interrupted" Errors

**Problem**: The agent would start speaking, then crash mid-sentence with "SpeechSynthesis interrupted".

**Debug process**:
- Added console logs everywhere to track state
- Realized `speechSynthesis.speaking` was still `true` when `recognition.start()` was called
- Calling `.cancel()` doesn't complete instantly

**Fix**:
- Call `speechSynthesis.cancel()` then wait 200ms before speaking
- After speaking ends, wait 500ms before restarting recognition
- Double-check both `isSpeaking` flag and `speechSynthesis.speaking` before starting

Lesson: Browser APIs are async. Always add timing buffers.

### 3. CORS Issues

**Problem**: Frontend on port 3001 couldn't talk to backend because CORS was configured for port 3000 only.

**Fix**: Update CORS to accept array of origins:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

Also normalized API URLs in frontend to handle trailing slashes.

### 4. Missing Dependencies in Production

**Problem**: Build failed with "Cannot find module 'recharts'" even though it was in package.json.

**Cause**: I had put production dependencies in `devDependencies`. Production builds don't install those.

**Fix**: Moved `recharts`, `react-query`, `axios`, `pdfkit`, `express-rate-limit` to `dependencies`.

Stupid mistake but easy to make.

### 5. Weather API Edge Cases

**Problem**: Sometimes the API returns empty arrays, or the date I'm looking for isn't in the forecast.

**Fix**: Defensive programming:
```typescript
if (!forecast) {
  console.warn('No forecast available');
  return null;
}

return {
  temperature: forecast.main?.temp ?? 25,
  condition: forecast.weather?.[0]?.main ?? 'Clear'
};
```

If weather fails, the booking flow continues without the seating recommendation. Core functionality isn't affected.

---

## Running It Locally

**Prerequisites**: Node 18+, MongoDB, OpenWeatherMap API key (free tier works)

**Quick start**:
```bash
# Option 1: Automated script
.\install.ps1

# Option 2: Manual
cd backend && npm install
cd ../frontend && npm install

# Create .env files (see .env.example)

# Run both servers
npm run dev   # from root directory
```

**Access**:
- Voice agent: http://localhost:3001
- Admin dashboard: http://localhost:3001/admin
- Admin analytics: http://localhost:3001/admin/analytics
- Admin bookings: http://localhost:3001/admin/bookings
- Admin export: http://localhost:3001/admin/export
- API: http://localhost:5000/api

---

## What I'd Do Differently for Production

**Right now** (< 1 week):
- Move sessions to Redis (currently in-memory, lost on restart)
- Add JWT auth to admin dashboard (it's wide open right now)
- Cache weather API responses (1 hour TTL)
- Dockerize everything

**Later** (1-2 months):
- Replace Web Speech API with Deepgram (better accuracy, works everywhere)
- Add MongoDB indexes for faster queries
- Set up logging (Winston + ELK stack)
- Distributed rate limiting with Redis

**Long term** (3-6 months):
- Microservices (separate voice service, booking service, analytics service)
- Event-driven architecture (RabbitMQ for notifications)
- Real-time updates with WebSockets
- Auto-scaling with Kubernetes

---

## API Endpoints

### Voice Agent API

#### `POST /api/agent/message`
Process voice input and manage conversation state.

**Request**:
```json
{
  "message": "I want to book a table for 4 people",
  "sessionId": "unique-session-id-123"
}
```

**Response**:
```json
{
  "reply": "Great! What's your name?",
  "state": "collecting_name",
  "userData": {
    "numberOfGuests": 4
  }
}
```

**Rate Limit**: 50 requests per 15 minutes

**States**: `greeting`, `collecting_name`, `collecting_guests`, `collecting_date`, `collecting_time`, `collecting_cuisine`, `collecting_requests`, `fetching_weather`, `confirm_booking`, `completed`

---

### Booking API

#### `GET /api/bookings`
Get all bookings (supports filtering).

**Query Parameters**:
- `status` (optional): Filter by status (pending/confirmed/cancelled/completed)
- `date` (optional): Filter by booking date (YYYY-MM-DD)

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ashutosh Pandey",
    "email": "ashutosh@example.com",
    "phone": "+919876543210",
    "numberOfGuests": 4,
    "date": "2024-12-10",
    "time": "19:00",
    "cuisine": "Italian",
    "specialRequests": "Window seat",
    "status": "confirmed",
    "sessionId": "abc123",
    "createdAt": "2024-12-04T10:30:00Z",
    "updatedAt": "2024-12-04T10:30:00Z"
  }
]
```

**Rate Limit**: 100 requests per 15 minutes

---

#### `POST /api/bookings`
Create a new booking.

**Request**:
```json
{
  "name": "Ashutosh Pandey",
  "email": "ashutosh@example.com",
  "phone": "+919876543210",
  "numberOfGuests": 4,
  "date": "2024-12-10",
  "time": "19:00",
  "cuisine": "Indian",
  "specialRequests": "Window seat preferred",
  "sessionId": "abc123"
}
```

**Response**:
```json
{
  "success": true,
  "bookingId": "507f1f77bcf86cd799439011",
  "message": "Booking created successfully"
}
```

**Rate Limit**: 10 requests per hour

---

#### `DELETE /api/bookings/:id`
Delete a specific booking.

**Parameters**:
- `id`: MongoDB ObjectId of the booking

**Response**:
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

**Rate Limit**: 100 requests per 15 minutes

---

### Admin Dashboard API

#### `GET /api/admin/analytics/stats`
Get overall booking statistics.

**Response**:
```json
{
  "totalBookings": 847,
  "pendingBookings": 23,
  "confirmedBookings": 612,
  "cancelledBookings": 89,
  "completedBookings": 123
}
```

**Rate Limit**: 200 requests per 15 minutes

---

#### `GET /api/admin/analytics/peak-hours`
Get booking distribution by hour of day (for staff scheduling).

**Response**:
```json
[
  { "hour": 12, "count": 45 },
  { "hour": 13, "count": 67 },
  { "hour": 18, "count": 89 },
  { "hour": 19, "count": 112 },
  { "hour": 20, "count": 98 }
]
```

**Rate Limit**: 200 requests per 15 minutes

---

#### `GET /api/admin/analytics/cuisine-distribution`
Get popular cuisines (for menu planning).

**Response**:
```json
[
  { "cuisine": "Italian", "count": 234 },
  { "cuisine": "Chinese", "count": 189 },
  { "cuisine": "Indian", "count": 156 },
  { "cuisine": "Mexican", "count": 98 }
]
```

**Rate Limit**: 200 requests per 15 minutes

---

#### `GET /api/admin/analytics/daily-trends`
Get daily booking counts for the last 30 days.

**Response**:
```json
[
  { "date": "2024-11-04", "count": 12 },
  { "date": "2024-11-05", "count": 18 },
  { "date": "2024-11-06", "count": 15 },
  { "date": "2024-11-07", "count": 22 }
]
```

**Rate Limit**: 200 requests per 15 minutes

---

#### `GET /api/admin/bookings/recent`
Get the 10 most recent bookings.

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ashutosh Pandey",
    "numberOfGuests": 4,
    "date": "2024-12-10",
    "time": "19:00",
    "status": "confirmed",
    "createdAt": "2024-12-04T10:30:00Z"
  }
]
```

**Rate Limit**: 200 requests per 15 minutes

---

### Export API

#### `GET /api/admin/export/csv`
Download all bookings as CSV file.

**Response**:
- Content-Type: `text/csv`
- Filename: `bookings_YYYY-MM-DD.csv`

**CSV Headers**:
```
Name,Email,Phone,Date,Time,Guests,Cuisine,Status,Special Requests
```

**Rate Limit**: 20 requests per hour

---

#### `GET /api/admin/export/pdf`
Download all bookings as formatted PDF.

**Response**:
- Content-Type: `application/pdf`
- Filename: `bookings_YYYY-MM-DD.pdf`

**PDF Contents**:
- Header with restaurant branding
- Table with all booking details
- Footer with generation timestamp

**Rate Limit**: 20 requests per hour

---

### Rate Limiting Summary

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Agent (`/api/agent/*`) | 50 requests | 15 minutes |
| Bookings (`/api/bookings/*`) | 10 requests (POST) | 1 hour |
| Admin (`/api/admin/*`) | 200 requests | 15 minutes |
| Export (`/api/admin/export/*`) | 20 requests | 1 hour |

All limits are per IP address.

---

## Future Ideas

- Email/SMS confirmations (SendGrid + Twilio)
- Multi-restaurant support (same admin panel, different locations)
- Payment integration (Stripe for deposits)
- Voice biometrics (recognize returning customers)
- Multi-language support (Hindi, Tamil, etc.)
- Real-time availability (prevent double bookings)

---

## What I Learned

- Browser speech APIs are powerful but tricky. Timing is everything.
- State machines make conversation logic predictable and debuggable.
- Rule-based NLP is perfectly fine for structured domains. Don't overcomplicate.
- External APIs will fail. Always design graceful degradation.
- TypeScript catches so many bugs before runtime. Worth the setup time.
- Separating business logic from HTTP handlers makes testing way easier.

---

**Built by Ashutosh Pandey**
MERN Stack Developer | Voice AI
[GitHub](https://github.com/ashutoshpandey18) • [LinkedIn](www.linkedin.com/in/ashutosh-pandey-87543b269)

This project helped me understand full-stack development, real-time voice processing, state management, and production-ready architecture. Feel free to use it as reference or reach out if you have questions.

---

MIT License
