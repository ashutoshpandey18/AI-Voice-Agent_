import React from 'react';

interface TranscriptProps {
  text: string;
  isInterim?: boolean;
}

/**
 * Transcript Component
 * Displays real-time speech-to-text transcript
 */
const Transcript: React.FC<TranscriptProps> = ({ text, isInterim }) => {
  if (!text) return null;

  return (
    <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 mb-1">
            {isInterim ? 'Listening...' : 'You said:'}
          </p>
          <p className={`text-base ${isInterim ? 'text-gray-500 italic' : 'text-gray-900'}`}>
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Transcript;
