import React from 'react';

interface VoiceButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

/**
 * Voice Button Component
 * Minimal microphone button for voice input
 */
const VoiceButton: React.FC<VoiceButtonProps> = ({ isListening, onStart, onStop, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isListening ? onStop : onStart}
        disabled={disabled}
        className={`
          relative w-24 h-24 rounded-full transition-all duration-300
          flex items-center justify-center shadow-lg
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-primary hover:bg-primary/90'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {/* Microphone Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>

        {/* Listening pulse effect */}
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
        )}
      </button>

      <p className="text-sm font-medium text-gray-600">
        {isListening ? 'Listening...' : 'Click to speak'}
      </p>
    </div>
  );
};

export default VoiceButton;
