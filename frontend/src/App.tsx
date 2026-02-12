import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ArrowRight, MessageSquare, Brain, BarChart3, ChevronLeft } from 'lucide-react';
import { speechService } from './services/speechService';
import { apiService, ConversationSlots, AgentResponse } from './services/apiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

function App() {
  const navigate = useNavigate();

  // Session ID
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

  // Browser support
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (sessionStarted) return;
    setSessionStarted(true);
    if (!speechService.isSupported()) {
      setIsSpeechSupported(false);
      addMessage('agent', 'Sorry, your browser does not support speech recognition. Please use Chrome or Edge.');
    }
  }, [sessionStarted]);

  const addMessage = (role: 'user' | 'agent', content: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleStartListening = () => {
    if (!isSpeechSupported || isProcessing) return;
    speechService.startListening(
      (transcript) => {
        if (!transcript || !transcript.trim()) return;
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

  const handleStopListening = () => {
    speechService.setAutoMode(false);
    speechService.stopListening();
    speechService.stopSpeaking();
    setIsListening(false);
  };

  const handleFinalTranscript = async (text: string) => {
    if (!text || !text.trim() || text.trim().length < 2) return;
    const trimmedText = text.trim();

    setTranscript(trimmedText);
    setIsInterim(false);
    addMessage('user', trimmedText);
    setTimeout(() => setTranscript(''), 2000);
    setIsProcessing(true);

    try {
      const response: AgentResponse = await apiService.sendMessage(sessionId, trimmedText, slots);
      setSlots(response.slots);
      if (response.weather) setWeatherInfo(response.weather);
      if (response.seatingRecommendation) setSeatingRecommendation(response.seatingRecommendation);
      if (response.readyToBook !== undefined) setReadyToBook(response.readyToBook);
      addMessage('agent', response.reply);

      if (response.readyToBook) {
        speechService.setAutoMode(false);
        setIsListening(false);
      }

      setIsProcessing(false);
      speechService.speak(response.reply);
    } catch (error: any) {
      console.error('API error:', error);
      addMessage('agent', 'Sorry, I encountered an error. Please try again.');
      setIsProcessing(false);
      speechService.speak('Sorry, I encountered an error. Please try again.');
    }
  };

  const handleConfirmBooking = async () => {
    if (!readyToBook || !slots.customerName || !slots.numberOfGuests || !slots.bookingDate || !slots.bookingTime || !slots.cuisinePreference) {
      addMessage('agent', 'Please provide all required information before confirming.');
      return;
    }

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
      addMessage('agent', `Excellent! Your booking has been confirmed (ID: ${result.booking.bookingId.slice(0, 8)}). We look forward to seeing you!`);

      speechService.speak('Excellent! Your booking has been confirmed. We look forward to seeing you!', () => {
        setTimeout(() => {
          setSlots({});
          setSeatingRecommendation(null);
          setWeatherInfo(null);
          setReadyToBook(false);
          addMessage('agent', 'Would you like to make another reservation?');
          setIsProcessing(false);
          speechService.speak('Would you like to make another reservation?', () => {
            if (isSpeechSupported) handleStartListening();
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

  const slotEntries = Object.entries(slots).filter(([, v]) => v !== undefined && v !== '');
  const hasSlots = slotEntries.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Subtle radial accent behind hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />

      {/* Top Navigation */}
      <nav className="relative z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-sm font-semibold text-neutral-900">Voice Agent</span>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Admin
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero Block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pt-16 pb-10"
        >
          <p className="text-xs tracking-widest uppercase text-neutral-500 mb-4">
            Voice Booking Demo
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 max-w-2xl mx-auto leading-tight">
            Book a Table by Speaking Naturally
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            A full-stack voice booking system that listens, understands, and confirms reservations through structured conversation — no forms required.
          </p>
        </motion.div>

        {/* Main Product Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 mb-16"
        >
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Card top strip */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-900">Voice Booking Agent</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Live Demo
              </span>
            </div>

            <div className="p-6 md:p-8">
              {/* Mic Button */}
              <div className="flex flex-col items-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={isListening ? handleStopListening : handleStartListening}
                  disabled={!isSpeechSupported || isProcessing}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-neutral-900 hover:bg-neutral-800'
                  } ${(!isSpeechSupported || isProcessing) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                  {isListening && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                  )}
                </motion.button>
                <p className="mt-3 text-sm text-neutral-500">
                  {isProcessing
                    ? 'Processing...'
                    : isListening
                      ? 'Listening -- tap to stop'
                      : 'Tap to start speaking'}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-100"
                >
                  <p className="text-xs font-medium text-neutral-400 mb-1">
                    {isInterim ? 'Listening...' : 'You said:'}
                  </p>
                  <p className={`text-sm ${isInterim ? 'text-neutral-400 italic' : 'text-neutral-900'}`}>
                    {transcript}
                  </p>
                </motion.div>
              )}

              {/* Booking Slots Card */}
              {hasSlots && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-5 bg-neutral-50 rounded-xl border border-neutral-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-900">Booking Details</h3>
                    {readyToBook && (
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        Ready
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    {slots.customerName && (
                      <div>
                        <span className="text-neutral-400">Name</span>
                        <p className="font-medium text-neutral-900">{slots.customerName}</p>
                      </div>
                    )}
                    {slots.numberOfGuests && (
                      <div>
                        <span className="text-neutral-400">Guests</span>
                        <p className="font-medium text-neutral-900">{slots.numberOfGuests}</p>
                      </div>
                    )}
                    {slots.bookingDate && (
                      <div>
                        <span className="text-neutral-400">Date</span>
                        <p className="font-medium text-neutral-900">{slots.bookingDate}</p>
                      </div>
                    )}
                    {slots.bookingTime && (
                      <div>
                        <span className="text-neutral-400">Time</span>
                        <p className="font-medium text-neutral-900">{slots.bookingTime}</p>
                      </div>
                    )}
                    {slots.cuisinePreference && (
                      <div>
                        <span className="text-neutral-400">Cuisine</span>
                        <p className="font-medium text-neutral-900">{slots.cuisinePreference}</p>
                      </div>
                    )}
                    {seatingRecommendation && (
                      <div>
                        <span className="text-neutral-400">Seating</span>
                        <p className="font-medium text-neutral-900 capitalize">{seatingRecommendation}</p>
                      </div>
                    )}
                  </div>
                  {weatherInfo && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 text-sm">
                      <span className="text-neutral-400">Weather</span>
                      <p className="font-medium text-neutral-900">
                        {weatherInfo.description} / {weatherInfo.temperature}C
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Conversation Panel */}
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Conversation
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageSquare className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                      <p className="text-sm text-neutral-400">
                        No messages yet. Tap the mic to start a conversation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white border border-neutral-200 text-neutral-900'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-neutral-400' : 'text-neutral-300'}`}>
                              {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Booking Button */}
              {readyToBook && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-center"
                >
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmBooking}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-neutral-900 text-white font-medium rounded-lg shadow-sm hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Booking'}
                    {!isProcessing && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </motion.div>
              )}

              {/* Browser Warning */}
              {!isSpeechSupported && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-sm text-amber-800">
                    Speech recognition is not supported in this browser. Please use Chrome or Edge.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare className="w-6 h-6 text-neutral-700" />,
                title: 'Voice Conversation Engine',
                desc: 'Structured dialogue flow that collects booking details through natural conversation.',
              },
              {
                icon: <Brain className="w-6 h-6 text-neutral-700" />,
                title: 'Rule-Based NLP Extraction',
                desc: 'Deterministic entity parsing for dates, times, guest counts, and cuisine preferences.',
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-neutral-700" />,
                title: 'Admin Analytics Dashboard',
                desc: 'Real-time booking metrics, conversation logs, and system health monitoring.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 bg-white rounded-xl border border-neutral-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
