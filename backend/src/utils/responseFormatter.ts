/**
 * Response Formatter Utility
 * Ensures all agent responses are in clean, professional English only
 * Removes any Hindi keywords that may have been accidentally produced
 * Provides fallback text for edge cases
 */

/**
 * Hindi keywords that should never appear in agent responses
 * These are removed and replaced with English equivalents
 */
const HINDI_KEYWORDS_TO_REMOVE: Record<string, string> = {
  // Greetings
  'namaste': '',
  'namaskar': '',
  'namaskaar': '',

  // Common words
  'aapka': 'your',
  'aap': 'you',
  'kya': 'what',
  'hai': 'is',
  'hain': 'are',
  'ka': 'of',
  'ke': 'of',
  'ki': 'of',
  'ko': 'to',
  'se': 'from',
  'me': 'in',
  'mein': 'in',
  'par': 'on',

  // Questions
  'kitne': 'how many',
  'kab': 'when',
  'kahan': 'where',
  'kaun': 'which',
  'kyun': 'why',
  'kaise': 'how',

  // Time/Date related
  'baje': "o'clock",
  'din': 'day',
  'raat': 'night',
  'subah': 'morning',
  'dopahar': 'afternoon',
  'shaam': 'evening',
  'aaj': 'today',
  'kal': 'tomorrow',
  'parso': 'day after tomorrow',

  // Food related
  'khana': 'food',
  'chahiye': 'would like',
  'pasand': 'prefer',

  // Quantities
  'log': 'people',
  'logon': 'people',
  'ek': 'one',
  'do': 'two',
  'teen': 'three',
  'char': 'four',
  'paanch': 'five',

  // Polite phrases
  'kripya': 'please',
  'dhanyavaad': 'thank you',
  'shukriya': 'thank you',
  'achha': 'good',
  'bahut': 'very',
  'thik': 'okay',

  // Booking related
  'book': 'book',
  'karna': 'to do',
  'chahte': 'want',
  'honge': 'will be',
  'intezaar': 'wait',
  'karenge': 'will do',
  'confirm': 'confirm',
  'ho': 'is',
  'gayi': 'done'
};

/**
 * Patterns to detect and clean Hindi text mixed with English
 */
const HINDI_PATTERN_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  // Remove bilingual greetings
  { pattern: /Hello!\s*Namaste!/gi, replacement: 'Hello!' },
  { pattern: /Namaste!\s*Hello!/gi, replacement: 'Hello!' },

  // Remove everything after "/" (bilingual separator)
  { pattern: /\/[^.!?]*([.!?]|$)/g, replacement: '$1' },

  // Remove parenthetical Hindi suggestions
  { pattern: /\([^)]*\)/gi, replacement: '' },

  // Clean up multiple spaces
  { pattern: /\s{2,}/g, replacement: ' ' },

  // Clean up space before punctuation
  { pattern: /\s+([.,!?;:])/g, replacement: '$1' },

  // Remove trailing/leading slashes
  { pattern: /\/\s*$/g, replacement: '' },
  { pattern: /^\s*\//g, replacement: '' }
];/**
 * State-specific English-only response templates
 * Used as fallbacks if sanitization produces empty/invalid text
 */
const ENGLISH_FALLBACK_TEMPLATES: Record<string, string> = {
  greeting: "Hello! I'd be happy to help you book a table. May I have your name, please?",
  collecting_name: "May I have your name, please?",
  collecting_guests: "Thank you! How many guests will be joining you?",
  collecting_date: "What date would you like to book for? You can say today, tomorrow, or any specific day.",
  collecting_time: "What time would you prefer? You can say times like 7 PM, 8 o'clock, or evening.",
  collecting_cuisine: "What type of cuisine would you like? We offer Italian, Chinese, Japanese, Indian, and more.",
  confirming: "Would you like to confirm this booking?",
  completed: "Great! Your booking has been confirmed. We look forward to seeing you!"
};

/**
 * Main sanitization function: Converts any response to clean English only
 *
 * @param agentReply - The raw agent reply that may contain Hindi/Hinglish
 * @param state - Optional conversation state for better fallback handling
 * @returns Clean, professional English-only response
 */
export function toEnglishResponse(agentReply: string, state?: string): string {
  if (!agentReply || typeof agentReply !== 'string') {
    return ENGLISH_FALLBACK_TEMPLATES.greeting;
  }

  let cleaned = agentReply.trim();

  // Step 1: Apply pattern-based replacements (remove bilingual structures)
  for (const { pattern, replacement } of HINDI_PATTERN_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Step 2: Remove Hindi keywords (case-insensitive, whole word matching)
  for (const [hindi, english] of Object.entries(HINDI_KEYWORDS_TO_REMOVE)) {
    // Match whole words only (with word boundaries)
    const regex = new RegExp(`\\b${hindi}\\b`, 'gi');
    if (english) {
      // Replace with English equivalent
      cleaned = cleaned.replace(regex, english);
    } else {
      // Remove the word entirely
      cleaned = cleaned.replace(regex, ' ');
    }
  }

  // Step 3: Remove any remaining non-English characters (Devanagari script)
  cleaned = cleaned.replace(/[\u0900-\u097F]/g, '');  // Step 4: Clean up whitespace and punctuation
  cleaned = cleaned
    .replace(/\s{2,}/g, ' ')           // Multiple spaces → single space
    .replace(/\s+([.,!?;:])/g, '$1')   // Space before punctuation
    .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1') // Duplicate punctuation
    .replace(/\s+$/g, '')              // Trailing spaces
    .replace(/^\s+/g, '')              // Leading spaces
    .trim();

  // Step 5: Validate result and use fallback if needed
  if (!cleaned || cleaned.length < 3 || !/[a-zA-Z]/.test(cleaned)) {
    // If sanitization produced invalid output, use fallback template
    if (state && ENGLISH_FALLBACK_TEMPLATES[state]) {
      return ENGLISH_FALLBACK_TEMPLATES[state];
    }
    return ENGLISH_FALLBACK_TEMPLATES.greeting;
  }

  // Step 6: Ensure first letter is capitalized
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Step 7: Ensure it ends with proper punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Sanitize multiple responses at once
 * Useful for batch processing or testing
 */
export function sanitizeResponses(responses: string[], state?: string): string[] {
  return responses.map(response => toEnglishResponse(response, state));
}

/**
 * Check if a response contains any Hindi keywords
 * Useful for debugging and quality assurance
 */
export function containsHindi(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Check for Hindi keywords
  for (const keyword of Object.keys(HINDI_KEYWORDS_TO_REMOVE)) {
    if (lowerText.includes(keyword)) {
      return true;
    }
  }

  // Check for Devanagari script (Unicode range)
  if (/[\u0900-\u097F]/.test(text)) {
    return true;
  }

  return false;
}

/**
 * Debug helper: Show what changes were made during sanitization
 */
export function sanitizeWithDebug(agentReply: string, state?: string): {
  original: string;
  sanitized: string;
  hadHindi: boolean;
  changes: string[];
} {
  const hadHindi = containsHindi(agentReply);
  const sanitized = toEnglishResponse(agentReply, state);

  const changes: string[] = [];
  if (agentReply !== sanitized) {
    changes.push('Response was sanitized');
    if (hadHindi) {
      changes.push('Hindi keywords were removed/replaced');
    }
  }

  return {
    original: agentReply,
    sanitized,
    hadHindi,
    changes
  };
}
