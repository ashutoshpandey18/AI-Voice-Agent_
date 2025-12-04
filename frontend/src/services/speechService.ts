/**
 * Speech Service
 * Manages Web Speech API for speech-to-text (STT) and text-to-speech (TTS).
 * Implements continuous listening loop: Listen → Process → Speak → Listen again.
 *
 * The global isSpeaking flag prevents TTS/STT overlap and interruptions.
 */

class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;  // Global flag: prevents TTS interruptions
  private autoMode: boolean = false;
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private lastTranscript: string = '';  // Track last transcript to prevent duplicates
  private lastTranscriptTime: number = 0;  // Timestamp of last transcript

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
  }

  /**
   * Initialize Speech Recognition (global instance)
   */
  private initializeRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[SpeechService] Speech Recognition not supported in this browser');
      return;
    }

    // Create global recognition instance
    this.recognition = new SpeechRecognition();

    if (!this.recognition) return;

    // Configure recognition behavior
    this.recognition.continuous = false;  // One utterance at a time
    this.recognition.interimResults = false;  // Only final results
    this.recognition.lang = 'en-US';

    // Add start event to confirm mic is active
    this.recognition.onstart = () => {
      console.log('[SpeechService] ✓ Microphone is now actively listening');
    };

    // Use event.resultIndex to get the correct result
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript.trim();

      console.log('[SpeechService] Speech result:', transcript);

      // Never send empty or undefined messages
      if (!transcript || transcript.length === 0) {
        console.warn('[SpeechService] Empty transcript, skipping');
        return;
      }

      // Prevent duplicate transcripts within 2 seconds
      const now = Date.now();
      if (transcript === this.lastTranscript && (now - this.lastTranscriptTime) < 2000) {
        console.warn('[SpeechService] Duplicate transcript detected, skipping:', transcript);
        return;
      }

      // Update last transcript tracking
      this.lastTranscript = transcript;
      this.lastTranscriptTime = now;

      // Send to callback for backend communication
      if (this.onResultCallback) {
        this.onResultCallback(transcript);
      }
    };

    // Error handler - log errors, only stop loop on critical failures
    this.recognition.onerror = (event: any) => {
      // Ignore harmless 'no-speech' and 'aborted' errors (but don't prevent restart)
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Don't log, don't set isListening to false, just let onend handle restart
        return;
      }

      console.error('[SpeechService] Speech error:', event.error);
      this.isListening = false;

      // Only report critical errors
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        if (this.onErrorCallback) {
          this.onErrorCallback('Microphone access denied. Please allow microphone permissions.');
        }
        this.autoMode = false;  // Stop auto mode on permission errors
      }
    };

    // Auto-restart when recognition ends (only if not speaking)
    this.recognition.onend = () => {
      console.log('[SpeechService] Recognition ended');
      this.isListening = false;

      // Only restart if not speaking (prevents interruptions)
      if (this.autoMode && !this.isSpeaking && !this.synthesis.speaking) {
        console.log('[SpeechService] Auto-restarting recognition');
        setTimeout(() => {
          // Double-check before restart
          if (!this.isSpeaking && !this.synthesis.speaking && this.autoMode) {
            try {
              // Clear last transcript to allow new input after restart
              this.lastTranscript = '';
              this.lastTranscriptTime = 0;

              this.startListening(this.onResultCallback!, this.onErrorCallback || undefined);
            } catch (error) {
              console.log('[SpeechService] Error auto-restarting (ignored):', error);
            }
          }
        }, 400);  // 400ms delay prevents overlap
      }
    };
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Start listening for speech input
   * Prevents start if TTS is currently speaking
   */
  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    // Safety check: Do not start if TTS is speaking
    if (this.isSpeaking || this.synthesis.speaking) {
      console.log('[SpeechService] TTS is speaking, delaying STT start');
      return;
    }

    // Don't restart if already listening
    if (this.isListening) {
      console.log('[SpeechService] Already listening, skipping restart');
      return;
    }

    // Store callbacks
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    try {
      this.recognition.start();
      this.isListening = true;
      this.autoMode = true;
      console.log('[SpeechService] Started listening');
    } catch (error: any) {
      // Gracefully handle "already started" error
      if (error.message && error.message.includes('already started')) {
        console.log('[SpeechService] Recognition already started, ignoring error');
        this.isListening = true;
      } else {
        console.error('[SpeechService] Error starting recognition:', error);
        this.isListening = false;
        onError?.(error.message);
      }
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    this.autoMode = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
        console.log('[SpeechService] Stopped listening');
      } catch (error) {
        // Ignore errors when stopping
        console.log('[SpeechService] Error stopping recognition (ignored)');
      }
    }

    this.isListening = false;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Speak text using text-to-speech
   * Prevents interruptions with proper timing and safety flags
   */
  async speak(text: string, onEnd?: () => void): Promise<void> {
    // Step 1: Set speaking flag first
    this.isSpeaking = true;

    // Step 2: Stop recognition completely (abort + stop)
    if (this.recognition && this.isListening) {
      try {
        // Use abort for immediate stop (more reliable than stop)
        if (typeof (this.recognition as any).abort === 'function') {
          (this.recognition as any).abort();
        }
        this.recognition.stop();
      } catch (error) {
        // Ignore stop errors
      }
      this.isListening = false;
    }

    // Step 3: Cancel any ongoing speech
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
      // Wait for cancellation to complete
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Step 4: Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    // Step 5: Handle TTS completion
    utterance.onend = () => {
      console.log('[SpeechService] TTS finished');

      // Clear speaking flag
      this.isSpeaking = false;

      // Call user callback first
      if (onEnd) {
        onEnd();
      }

      // Safe delay before restarting STT (prevents interruptions)
      if (this.autoMode && this.onResultCallback) {
        setTimeout(() => {
          console.log('[SpeechService] Auto-restarting recognition after TTS');
          // Double-check we're not speaking
          if (!this.isSpeaking && !this.synthesis.speaking) {
            try {
              this.startListening(this.onResultCallback!, this.onErrorCallback || undefined);
            } catch (error) {
              console.log('[SpeechService] Error restarting after TTS (ignored):', error);
            }
          }
        }, 500);  // 500ms delay prevents overlap
      }
    };

    // Step 6: Handle TTS errors (prevents getting stuck)
    utterance.onerror = (event) => {
      console.error('[SpeechService] TTS error:', event);

      // Clear speaking flag
      this.isSpeaking = false;

      // Still restart listening even if TTS fails
      if (this.autoMode && this.onResultCallback) {
        setTimeout(() => {
          if (!this.isSpeaking && !this.synthesis.speaking) {
            try {
              this.startListening(this.onResultCallback!, this.onErrorCallback || undefined);
            } catch (error) {
              console.log('[SpeechService] Error restarting after TTS error (ignored):', error);
            }
          }
        }, 500);
      }
    };

    console.log('[SpeechService] Speaking:', text);
    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    this.isSpeaking = false;
    this.synthesis.cancel();
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking || this.synthesis.speaking;
  }

  /**
   * Enable or disable auto mode
   */
  setAutoMode(enabled: boolean): void {
    this.autoMode = enabled;
    console.log('[SpeechService] Auto mode:', enabled);
  }

  /**
   * Get auto mode status
   */
  getAutoMode(): boolean {
    return this.autoMode;
  }
}

export const speechService = new SpeechService();
