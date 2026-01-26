/**
 * Currency formatting utilities for South African Rand (ZAR)
 * Can be extended to support multiple currencies in the future
 */

export type CurrencyCode = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  ZAR: { code: 'ZAR', symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
};

// Default currency for the application
export const DEFAULT_CURRENCY: CurrencyCode = 'ZAR';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - The currency code (default: ZAR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  const config = CURRENCIES[currencyCode];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency with compact notation for large amounts
 * @param amount - The amount to format
 * @param currencyCode - The currency code (default: ZAR)
 * @returns Formatted currency string (e.g., R1.2M)
 */
export function formatCurrencyCompact(amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  const config = CURRENCIES[currencyCode];
  
  if (Math.abs(amount) >= 1000000) {
    return `${config.symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${config.symbol}${(amount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount, currencyCode);
}

/**
 * Parse a currency string to number
 * @param value - The currency string to parse
 * @returns The numeric value
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and formatting
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Get currency symbol
 * @param currencyCode - The currency code
 * @returns The currency symbol
 */
export function getCurrencySymbol(currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  return CURRENCIES[currencyCode].symbol;
}

/**
 * Get all available currencies for selection
 * @returns Array of currency configurations
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES);
}
