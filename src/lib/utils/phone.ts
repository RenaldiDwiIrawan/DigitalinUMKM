/**
 * Extracts and cleans the best phone number from a given input string.
 * Supports Indonesian formats (+62, 62, 08).
 */
export const extractBestPhone = (input: string): string | null => {
  if (!input) return null;
  
  const phoneRegex = /(?:\+62|62|0)(?:\d{2,4})[\s.-]?(?:\d{3,5})[\s.-]?(?:\d{3,5})|(?:\+62|62|0)8[1-9][0-9]{7,11}/g;
  const matches = input.match(phoneRegex);
  if (!matches) return null;

  const prioritizedMatches = matches.sort((a, b) => {
    const score = (s: string) => {
      const digits = s.replace(/[^\d]/g, '');
      if (s.startsWith('+62') || s.startsWith('62')) return 100;
      if (s.startsWith('08')) return 90;
      if (digits.length >= 10) return 80;
      return digits.length;
    };
    return score(b) - score(a);
  });

  const bestMatch = prioritizedMatches.find(m => {
    const digits = m.replace(/[^\d]/g, '');
    return digits.length >= 7 && !/^19\d{2}$|^20\d{2}$/.test(digits);
  });

  if (!bestMatch) return null;

  // Clean the number from any non-phone characters
  return bestMatch.replace(/[^\d\s\-\+\(\)]/g, '').trim();
};

/**
 * Formats a phone number for API/WhatsApp usage (converts 0 to 62).
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

