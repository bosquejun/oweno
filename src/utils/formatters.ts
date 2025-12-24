/**
 * Map of common currency codes to their respective symbols.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'PHP': '₱',
  'USD': '$',
  'EUR': '€',
  'JPY': '¥',
  'GBP': '£',
};

/**
 * Formats a number as a specific currency based on user preference.
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'PHP', 
  locale: string = 'en-PH'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback if locale/currency combination is invalid
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};

/**
 * Strips the currency symbol and formatting for raw number display.
 */
export const formatNumber = (amount: number, locale: string = 'en-PH'): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

