// ============================================================
// NETWORTH — Utility Functions
// ============================================================

/**
 * Format a number as Indian Rupees with appropriate suffix
 * ₹1,234 | ₹12.5K | ₹1.5L | ₹2.3Cr | ₹150Cr
 */
export function formatCurrency(amount: number, compact: boolean = true): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (!compact || abs < 10000) {
    return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
  }
  if (abs < 100000) {
    // Thousands: ₹12.5K
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  if (abs < 10000000) {
    // Lakhs: ₹1.5L
    const lakhs = abs / 100000;
    return `${sign}₹${lakhs >= 10 ? Math.round(lakhs) : lakhs.toFixed(1)}L`;
  }
  // Crores: ₹2.3Cr
  const crores = abs / 10000000;
  return `${sign}₹${crores >= 100 ? Math.round(crores) : crores.toFixed(1)}Cr`;
}

/**
 * Format currency with full precision (no abbreviation)
 */
export function formatCurrencyFull(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}`;
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format months into human-readable duration
 */
export function formatDuration(months: number): string {
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years}y ${remaining}m`;
}

/**
 * Calculate age from starting age + months played
 */
export function calculateAge(startAge: number, monthsPlayed: number): number {
  return startAge + Math.floor(monthsPlayed / 12);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random boolean with given probability (0-1)
 */
export function randomChance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Pick a random item from an array
 */
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Format the in-game date (month/year)
 */
export function formatGameDate(month: number, startAge: number = 22): string {
  const year = Math.floor((month - 1) / 12) + 1;
  const monthInYear = ((month - 1) % 12) + 1;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const age = startAge + year - 1;
  return `${monthNames[monthInYear - 1]}, Year ${year} (Age ${age})`;
}

/**
 * Calculate EMI for a loan
 * P × r × (1+r)^n / ((1+r)^n - 1)
 */
export function calculateEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Calculate compound interest
 */
export function compoundInterest(principal: number, rate: number, periods: number): number {
  return principal * Math.pow(1 + rate, periods);
}

/**
 * Get color class for money values
 */
export function getMoneyColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Get change prefix
 */
export function getChangePrefix(value: number): string {
  return value > 0 ? '+' : '';
}

/**
 * Progressive tax calculation (Indian slab style)
 */
export function calculateTax(annualIncome: number): number {
  // Simplified progressive slab
  if (annualIncome <= 500000) return 0;
  if (annualIncome <= 1000000) return (annualIncome - 500000) * 0.1;
  if (annualIncome <= 2000000) return 50000 + (annualIncome - 1000000) * 0.2;
  return 250000 + (annualIncome - 2000000) * 0.3;
}
