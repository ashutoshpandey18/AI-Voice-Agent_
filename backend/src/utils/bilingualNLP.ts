/**
 * Bilingual NLP Utilities
 * FREE rule-based NLP for Hindi + English with code-switching support
 * No paid APIs (GPT/OpenAI/Claude) required
 */

/**
 * Hindi-English Number Mapping
 */
export const hindiNumbers: { [key: string]: number } = {
  // Hindi number words
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
  'cheh': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
  'solah': 16, 'satrah': 17, 'atharah': 18, 'unnis': 19, 'bees': 20,

  // English number words
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
};

/**
 * Hindi-English Date Keywords
 */
export const hindiDates: { [key: string]: number | string } = {
  // Relative dates (offset in days)
  'aaj': 0,
  'today': 0,
  'kal': 1,
  'tomorrow': 1,
  'parso': 2,
  'narso': 2,

  // Days of week (Hindi)
  'somvar': 'monday',
  'somwar': 'monday',
  'mangalvar': 'tuesday',
  'mangalwar': 'tuesday',
  'budhvar': 'wednesday',
  'budhwar': 'wednesday',
  'guruvar': 'thursday',
  'guruwar': 'thursday',
  'shukravar': 'friday',
  'shukrawar': 'friday',
  'shanivar': 'saturday',
  'shaniwar': 'saturday',
  'ravivar': 'sunday',
  'raviwar': 'sunday',

  // Days of week (English)
  'monday': 'monday',
  'tuesday': 'tuesday',
  'wednesday': 'wednesday',
  'thursday': 'thursday',
  'friday': 'friday',
  'saturday': 'saturday',
  'sunday': 'sunday'
};

/**
 * Hindi-English Time-of-Day Mapping
 */
export const hindiTimeOfDay: { [key: string]: 'AM' | 'PM' } = {
  // Hindi time descriptors
  'subah': 'AM',
  'savera': 'AM',
  'dopahar': 'PM',
  'shaam': 'PM',
  'sham': 'PM',
  'raat': 'PM',

  // English time descriptors
  'morning': 'AM',
  'afternoon': 'PM',
  'evening': 'PM',
  'night': 'PM'
};

/**
 * Hindi Keywords for People/Guests
 */
export const hindiGuestKeywords = [
  'log', 'loge', 'logon', // people
  'aadmi', 'aadmiyon', // people/men
  'vyakti', // person
  'honge', 'hain', 'hai', // will be/are/is
  'ayenge', 'aayenge', // will come
  'people', 'guests', 'person', 'persons'
];

/**
 * Cuisine Mapping (Hindi + English)
 */
export const cuisineMap: { [key: string]: string } = {
  // Italian
  'italian': 'Italian',
  'italvi': 'Italian',
  'pasta': 'Italian',
  'pizza': 'Italian',

  // Chinese
  'chinese': 'Chinese',
  'chini': 'Chinese',
  'cheeni': 'Chinese',
  'china': 'Chinese',
  'noodles': 'Chinese',

  // Indian
  'indian': 'Indian',
  'bharatiya': 'Indian',
  'bharatiye': 'Indian',
  'hindustani': 'Indian',
  'desi': 'Indian',
  'curry': 'Indian',
  'tandoori': 'Indian',
  'biryani': 'Indian',

  // Japanese
  'japanese': 'Japanese',
  'japani': 'Japanese',
  'sushi': 'Japanese',
  'ramen': 'Japanese',

  // Mexican
  'mexican': 'Mexican',
  'mexicano': 'Mexican',
  'tacos': 'Mexican',
  'burrito': 'Mexican',

  // Thai
  'thai': 'Thai',
  'thailand': 'Thai',

  // French
  'french': 'French',
  'fransisi': 'French',

  // Mediterranean
  'mediterranean': 'Mediterranean',
  'greek': 'Greek',

  // American
  'american': 'American',
  'burger': 'American',

  // Korean
  'korean': 'Korean',
  'koreai': 'Korean',

  // Lebanese
  'lebanese': 'Lebanese',
  'arabic': 'Lebanese',
  'arabi': 'Lebanese',

  // Turkish
  'turkish': 'Turkish',
  'turki': 'Turkish'
};

/**
 * Special Request Keywords (Hindi + English)
 */
export const specialRequestKeywords: { [key: string]: string } = {
  // Birthday
  'birthday': 'birthday celebration',
  'janmdin': 'birthday celebration',
  'janamdin': 'birthday celebration',
  'bday': 'birthday celebration',

  // Anniversary
  'anniversary': 'anniversary celebration',
  'saalgirah': 'anniversary celebration',
  'salgirah': 'anniversary celebration',

  // Kids/Children
  'kids': 'kids present',
  'children': 'kids present',
  'bachche': 'kids present',
  'bacche': 'kids present',
  'bacha': 'kids present',

  // Allergies
  'allergy': 'food allergy',
  'allergic': 'food allergy',
  'elerji': 'food allergy',

  // Dietary
  'vegetarian': 'vegetarian',
  'veg': 'vegetarian',
  'shakahari': 'vegetarian',
  'vegan': 'vegan',
  'gluten': 'gluten-free',

  // Accessibility
  'wheelchair': 'wheelchair access',
  'disabled': 'wheelchair access',
  'viklang': 'wheelchair access',
  'highchair': 'highchair needed',
  'baby': 'highchair needed'
};

/**
 * Extract numbers from Hindi/English mixed text
 * Examples: "5 log", "paanch people", "hum 4 honge", "maybe teen"
 */
export function extractBilingualNumber(text: string): number | null {
  const normalized = text.toLowerCase().trim();

  // First try: extract digit numbers
  const digitMatch = normalized.match(/\d+/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0]);
    if (num >= 1 && num <= 20) {
      return num;
    }
  }

  // Second try: match Hindi/English number words
  for (const [word, num] of Object.entries(hindiNumbers)) {
    const wordPattern = new RegExp(`\\b${word}\\b`, 'i');
    if (wordPattern.test(normalized)) {
      return num;
    }
  }

  // Third try: "me and X more" / "main aur X"
  const meAndMorePatterns = [
    /(?:me|main|mai)\s+(?:and|aur)\s+(\d+)\s+(?:more|aur|log)?/i,
    /(\d+)\s+(?:aur|and)\s+(?:me|main|mai)/i
  ];

  for (const pattern of meAndMorePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const num = parseInt(match[1]) + 1;
      if (num >= 1 && num <= 20) {
        return num;
      }
    }
  }

  return null;
}

/**
 * Extract date from Hindi/English mixed text
 * Examples: "kal", "parso", "friday", "somvar", "kal shaam", "next Friday"
 */
export function extractBilingualDate(text: string): Date | null {
  const normalized = text.toLowerCase().trim();
  const today = new Date();

  // Try relative dates (aaj, kal, parso)
  for (const [keyword, offset] of Object.entries(hindiDates)) {
    if (typeof offset === 'number') {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(normalized)) {
        const date = new Date(today);
        date.setDate(date.getDate() + offset);
        return date;
      }
    }
  }

  // Try day names (Monday, Somvar, etc.)
  for (const [keyword, dayName] of Object.entries(hindiDates)) {
    if (typeof dayName === 'string') {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(normalized)) {
        const isNext = /(?:next|agle|agla)/i.test(normalized);
        return getNextDayOfWeek(dayName as string, isNext);
      }
    }
  }

  // Try specific date patterns: "12 March", "12/03/2025"
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i
  ];

  for (const pattern of datePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      return parseDateFromMatch(match);
    }
  }

  return null;
}

/**
 * Extract time from Hindi/English mixed text
 * Examples: "7 baje", "shaam 7", "raat 9", "evening 7", "at 7"
 */
export function extractBilingualTime(text: string): string | null {
  const normalized = text.toLowerCase().trim();

  // Pattern 1: "7 baje", "9 baje"
  const bajeMatch = normalized.match(/(\d{1,2})\s*baje/i);
  if (bajeMatch) {
    const hour = parseInt(bajeMatch[1]);

    // Check for time-of-day context
    for (const [keyword, meridiem] of Object.entries(hindiTimeOfDay)) {
      if (normalized.includes(keyword)) {
        const hour24 = convertTo24Hour(hour, meridiem);
        return `${String(hour24).padStart(2, '0')}:00`;
      }
    }

    // Default: if hour is dinner time (5-11), assume PM
    if (hour >= 5 && hour <= 11) {
      return `${String(hour + 12).padStart(2, '0')}:00`;
    }
    return `${String(hour).padStart(2, '0')}:00`;
  }

  // Pattern 2: "shaam 7", "raat 9", "evening 7"
  for (const [keyword, meridiem] of Object.entries(hindiTimeOfDay)) {
    const timePattern = new RegExp(`${keyword}\\s*(\\d{1,2})`, 'i');
    const reversePattern = new RegExp(`(\\d{1,2})\\s*${keyword}`, 'i');

    let match = normalized.match(timePattern) || normalized.match(reversePattern);
    if (match) {
      const hour = parseInt(match[1]);
      const hour24 = convertTo24Hour(hour, meridiem);
      return `${String(hour24).padStart(2, '0')}:00`;
    }
  }

  // Pattern 3: Standard time formats "7pm", "7:30pm", "19:00"
  const standardPatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
    /(?:at|around|about)?\s*(\d{1,2})\s*(am|pm)/i
  ];

  for (const pattern of standardPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const meridiem = match[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
    }
  }

  // Pattern 4: Just a number with context
  const hourMatch = normalized.match(/\b(\d{1,2})\b/);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1]);

    // Check for time-of-day keywords
    for (const [keyword, meridiem] of Object.entries(hindiTimeOfDay)) {
      if (normalized.includes(keyword)) {
        const hour24 = convertTo24Hour(hour, meridiem);
        return `${String(hour24).padStart(2, '0')}:00`;
      }
    }

    // Default assumption for dinner range
    if (hour >= 5 && hour <= 11) {
      return `${String(hour + 12).padStart(2, '0')}:00`;
    }
  }

  return null;
}

/**
 * Extract cuisine from Hindi/English mixed text
 * Examples: "Italian chahiye", "chini khana", "Chinese food"
 */
export function extractBilingualCuisine(text: string): string | null {
  const normalized = text.toLowerCase().trim();

  // Check all cuisine keywords
  for (const [keyword, cuisineName] of Object.entries(cuisineMap)) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (pattern.test(normalized)) {
      return cuisineName;
    }
  }

  // Check for "X khana" or "X food" patterns
  const foodPatterns = [
    /(\w+)\s+(?:khana|food)/i,
    /(?:khana|food)\s+(\w+)/i
  ];

  for (const pattern of foodPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const keyword = match[1].toLowerCase();
      if (cuisineMap[keyword]) {
        return cuisineMap[keyword];
      }
    }
  }

  return null;
}

/**
 * Extract special requests from Hindi/English mixed text
 * Examples: "birthday hai", "bachche honge", "anniversary"
 */
export function extractBilingualSpecialRequests(text: string): string[] {
  const normalized = text.toLowerCase().trim();
  const detected: string[] = [];

  for (const [keyword, description] of Object.entries(specialRequestKeywords)) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (pattern.test(normalized)) {
      if (!detected.includes(description)) {
        detected.push(description);
      }
    }
  }

  return detected;
}

/**
 * Helper: Convert 12-hour to 24-hour format
 */
function convertTo24Hour(hour: number, meridiem: 'AM' | 'PM'): number {
  if (meridiem === 'PM' && hour < 12) {
    return hour + 12;
  }
  if (meridiem === 'AM' && hour === 12) {
    return 0;
  }
  return hour;
}

/**
 * Helper: Get next occurrence of a day of week
 */
function getNextDayOfWeek(dayName: string, nextWeek: boolean = false): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayName.toLowerCase());

  if (targetDay === -1) return new Date();

  const today = new Date();
  const currentDay = today.getDay();
  let daysUntilTarget = targetDay - currentDay;

  if (daysUntilTarget <= 0 || nextWeek) {
    daysUntilTarget += 7;
  }

  const result = new Date(today);
  result.setDate(today.getDate() + daysUntilTarget);
  return result;
}

/**
 * Helper: Parse date from regex match
 */
function parseDateFromMatch(match: RegExpMatchArray): Date | null {
  const months: { [key: string]: number } = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
  };

  let day: number, month: number, year: number;

  // DD/MM/YYYY format
  if (match[0].includes('/')) {
    day = parseInt(match[1]);
    month = parseInt(match[2]) - 1;
    year = parseInt(match[3]);
  }
  // "12 March" or "March 12" format
  else if (match[1] && match[2]) {
    if (isNaN(parseInt(match[1]))) {
      month = months[match[1].toLowerCase()];
      day = parseInt(match[2]);
    } else {
      day = parseInt(match[1]);
      month = months[match[2].toLowerCase()];
    }
    year = new Date().getFullYear();
  } else {
    return null;
  }

  return new Date(year, month, day);
}

/**
 * Helper: Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
