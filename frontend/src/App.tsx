import { useState, useEffect } from 'react';
import VoiceButton from './components/VoiceButton';
import Transcript from './components/Transcript';
import ChatMessages, { ChatMessage } from './components/ChatMessages';
import { speechService } from './services/speechService';
import { apiService, ConversationSlots, AgentResponse } from './services/apiService';

/**
 * Main App Component
 * Minimal + Interactive Voice Agent Frontend
 */
function App() {
  // Session ID for conversation tracking
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // UI State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isInterim, setIsInterim] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversation State
  const [slots, setSlots] = useState<ConversationSlots>({});
  const [seatingRecommendation, setSeatingRecommendation] = useState<'indoor' | 'outdoor' | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [readyToBook, setReadyToBook] = useState(false);

  // Browser support check
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  //  SESSION FLAG: Prevents duplicate greeting messages
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    //  Only run setup ONCE per session
    if (sessionStarted) return;

    setSessionStarted(true);

    //  Only check browser support - NO frontend greeting
    if (!speechService.isSupported()) {
      setIsSpeechSupported(false);
      addMessage('agent', 'Sorry, your browser does not support speech recognition. Please use Chrome or Edge.');
    }
    // Backend will send the greeting as part of the first agent response
  }, [sessionStarted]);

  /**
   * Add a message to the chat
   */
  const addMessage = (role: 'user' | 'agent', content: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  /**
   * Handle voice input start
   */
  const handleStartListening = () => {
    if (!isSpeechSupported || isProcessing) return;

    speechService.startListening(
      (transcript) => {
        // Only process non-empty transcripts
        if (!transcript || !transcript.trim()) {
          console.warn('[App] Empty transcript received, skipping');
          return;
        }

        console.log('[App] Processing transcript:', transcript);
        handleFinalTranscript(transcript);
      },
      (error) => {
        console.error('[App] Speech error:', error);
        setIsListening(false);
        addMessage('agent', 'Sorry, I had trouble hearing you. Please try speaking clearly and try again.');
      }
    );

    setIsListening(true);
  };

  /**
   * Handle voice input stop
   */
  const handleStopListening = () => {
    speechService.setAutoMode(false);
    speechService.stopListening();
    speechService.stopSpeaking();
    setIsListening(false);
  };

  /**
   * Handle final transcript and send to backend
   */
  const handleFinalTranscript = async (text: string) => {
    // Block empty, undefined, or whitespace-only messages
    if (!text || !text.trim() || text.trim().length === 0) {
      console.warn('[App] Empty or invalid message blocked');
      return;
    }

    const trimmedText = text.trim();

    // Ignore very short meaningless input
    if (trimmedText.length < 2) {
      console.warn('[App] Message too short, ignoring');
      return;
    }

    // Show transcript in UI
    setTranscript(trimmedText);
    setIsInterim(false);

    // Add user message to chat
    addMessage('user', trimmedText);

    // Reset transcript after a moment
    setTimeout(() => setTranscript(''), 2000);

    setIsProcessing(true);

    try {
      // Send message to agent
      const response: AgentResponse = await apiService.sendMessage(
        sessionId,
        trimmedText,
        slots
      );

      // Update slots
      setSlots(response.slots);

      // Update weather and seating recommendation
      if (response.weather) {
        setWeatherInfo(response.weather);
      }
      if (response.seatingRecommendation) {
        setSeatingRecommendation(response.seatingRecommendation);
      }
      if (response.readyToBook !== undefined) {
        setReadyToBook(response.readyToBook);
      }

      // Add agent response to chat
      addMessage('agent', response.reply);

      // If ready to book, disable auto mode
      if (response.readyToBook) {
        speechService.setAutoMode(false);
        setIsListening(false);
      }

      setIsProcessing(false);

      // Speak the response (speechService will auto-restart listening after)
      speechService.speak(response.reply);

    } catch (error: any) {
      console.error('API error:', error);
      addMessage('agent', 'Sorry, I encountered an error. Please try again.');
      setIsProcessing(false);

      // Speak error message and continue listening
      speechService.speak('Sorry, I encountered an error. Please try again.');
    }
  };

  /**
   * Handle booking confirmation
   */
  const handleConfirmBooking = async () => {
    if (!readyToBook || !slots.customerName || !slots.numberOfGuests || !slots.bookingDate || !slots.bookingTime || !slots.cuisinePreference) {
      addMessage('agent', 'Please provide all required information before confirming.');
      return;
    }

    // Stop continuous mode during booking
    speechService.setAutoMode(false);
    setIsListening(false);
    setIsProcessing(true);

    try {
      const booking = {
        customerName: slots.customerName,
        numberOfGuests: slots.numberOfGuests,
        bookingDate: slots.bookingDate,
        bookingTime: slots.bookingTime,
        cuisinePreference: slots.cuisinePreference,
        specialRequests: slots.specialRequests || '',
        seatingPreference: seatingRecommendation || 'indoor',
        weatherInfo: weatherInfo
      };

      const result = await apiService.createBooking(booking);

      addMessage('agent', `🎉 Excellent! Your booking has been confirmed (ID: ${result.booking.bookingId.slice(0, 8)}). We look forward to seeing you!`);

      // Speak confirmation
      speechService.speak('Excellent! Your booking has been confirmed. We look forward to seeing you!', () => {
        // Reset for new booking after confirmation speech
        setTimeout(() => {
          setSlots({});
          setSeatingRecommendation(null);
          setWeatherInfo(null);
          setReadyToBook(false);
          addMessage('agent', 'Would you like to make another reservation?');
          setIsProcessing(false);

          // Ask for new booking
          speechService.speak('Would you like to make another reservation?', () => {
            if (isSpeechSupported) {
              // Re-enable auto mode and start listening
              handleStartListening();
            }
          });
        }, 2000);
      });

    } catch (error: any) {
      console.error('Booking error:', error);
      addMessage('agent', `Failed to create booking: ${error.message}`);
      speechService.speak(`Failed to create booking. ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            🎙️ AI Voice Agent
          </h1>
          <p className="text-sm text-gray-600 text-center mt-2">
            Restaurant Booking System
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">

          {/* Voice Button */}
          <div className="flex justify-center">
            <VoiceButton
              isListening={isListening}
              onStart={handleStartListening}
              onStop={handleStopListening}
              disabled={!isSpeechSupported || isProcessing}
            />
          </div>

          {/* Transcript Display */}
          {transcript && (
            <Transcript text={transcript} isInterim={isInterim} />
          )}

          {/* Booking Info Card */}
          {Object.keys(slots).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Booking Details
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {slots.customerName && (
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium text-gray-900">{slots.customerName}</span>
                  </div>
                )}
                {slots.numberOfGuests && (
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <span className="ml-2 font-medium text-gray-900">{slots.numberOfGuests}</span>
                  </div>
                )}
                {slots.bookingDate && (
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 font-medium text-gray-900">{slots.bookingDate}</span>
                  </div>
                )}
                {slots.bookingTime && (
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <span className="ml-2 font-medium text-gray-900">{slots.bookingTime}</span>
                  </div>
                )}
                {slots.cuisinePreference && (
                  <div>
                    <span className="text-gray-500">Cuisine:</span>
                    <span className="ml-2 font-medium text-gray-900">{slots.cuisinePreference}</span>
                  </div>
                )}
                {seatingRecommendation && (
                  <div>
                    <span className="text-gray-500">Seating:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{seatingRecommendation}</span>
                  </div>
                )}
              </div>

              {weatherInfo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Weather Forecast</p>
                  <p className="text-sm text-blue-900">
                    {weatherInfo.description} • {weatherInfo.temperature}°C
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Chat Messages */}
          <ChatMessages messages={messages} />

          {/* Confirm Button */}
          {readyToBook && (
            <div className="flex justify-center">
              <button
                onClick={handleConfirmBooking}
                disabled={isProcessing}
                className="
                  px-8 py-4 bg-secondary text-white font-semibold rounded-lg
                  shadow-lg hover:bg-secondary/90 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                "
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isProcessing ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          )}

          {/* Browser Support Warning */}
          {!isSpeechSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800">
                ⚠️ Speech recognition is not supported in this browser. Please use Chrome or Edge for the best experience.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center text-sm text-gray-500">
        <p>Powered by Web Speech API & AI</p>
      </footer>
    </div>
  );
}

export default App;
