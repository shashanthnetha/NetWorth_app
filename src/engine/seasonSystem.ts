// ============================================================
// NETWORTH — Season & Festival System
// ============================================================

import { SeasonalEffect } from './types';

export const SEASONAL_EFFECTS: SeasonalEffect[] = [
  {
    id: 'diwali',
    name: 'Diwali Season 🪔',
    month: 11,       // November
    duration: 1,
    effects: {
      businessRevenueMultiplier: 1.30,
      stockMarketMultiplier: 1.05,
      salaryBonus: 0.5,           // half-month bonus
      expenseMultiplier: 1.20,    // festive spending
    },
    description: 'Festival of lights! Businesses boom, bonuses arrive, spending spikes.',
    icon: '🪔',
  },
  {
    id: 'budget_day',
    name: 'Union Budget Day 📋',
    month: 2,        // February
    duration: 1,
    effects: {
      stockMarketMultiplier: 0.95,    // volatility
      taxChanges: -0.02,              // slight tax reduction
    },
    description: 'Budget day causes market volatility. Tax changes may apply.',
    icon: '📋',
  },
  {
    id: 'ipo_season',
    name: 'IPO Season 🚀',
    month: 3,        // March-April
    duration: 2,
    effects: {
      stockMarketMultiplier: 1.08,
    },
    description: 'Companies rush to list before year-end. Market buzzes with new IPOs.',
    icon: '🚀',
  },
  {
    id: 'monsoon',
    name: 'Monsoon Season 🌧️',
    month: 7,        // July-September
    duration: 3,
    effects: {
      businessRevenueMultiplier: 0.90,   // some businesses slow down
      expenseMultiplier: 1.05,
    },
    description: 'Rains slow logistics. Agricultural stocks up, construction down.',
    icon: '🌧️',
  },
  {
    id: 'black_friday',
    name: 'Black Friday / Sale Season 🏷️',
    month: 11,
    duration: 1,
    effects: {
      businessRevenueMultiplier: 1.50,    // e-commerce boom
      expenseMultiplier: 1.30,
    },
    description: 'Online shopping frenzy. E-commerce businesses see massive spikes.',
    icon: '🏷️',
  },
  {
    id: 'year_end',
    name: 'Year End 🎄',
    month: 12,
    duration: 1,
    effects: {
      salaryBonus: 1.0,           // full month bonus
      expenseMultiplier: 1.25,    // holiday spending
      stockMarketMultiplier: 1.03,
    },
    description: 'Year-end bonuses, holiday spending, and market rally.',
    icon: '🎄',
  },
];

/** Get active seasonal effects for a given month */
export function getActiveSeasonalEffects(gameMonth: number): SeasonalEffect[] {
  const calendarMonth = ((gameMonth - 1) % 12) + 1;

  return SEASONAL_EFFECTS.filter((season) => {
    const end = season.month + season.duration - 1;
    if (end <= 12) {
      return calendarMonth >= season.month && calendarMonth <= end;
    }
    // Wrap around (e.g., Dec-Jan)
    return calendarMonth >= season.month || calendarMonth <= end - 12;
  });
}

/** Calculate combined seasonal multipliers */
export function calculateSeasonalMultipliers(gameMonth: number): {
  businessRevenue: number;
  stockMarket: number;
  salaryBonus: number;
  expenses: number;
} {
  const active = getActiveSeasonalEffects(gameMonth);

  let businessRevenue = 1;
  let stockMarket = 1;
  let salaryBonus = 0;
  let expenses = 1;

  for (const season of active) {
    if (season.effects.businessRevenueMultiplier) {
      businessRevenue *= season.effects.businessRevenueMultiplier;
    }
    if (season.effects.stockMarketMultiplier) {
      stockMarket *= season.effects.stockMarketMultiplier;
    }
    if (season.effects.salaryBonus) {
      salaryBonus += season.effects.salaryBonus;
    }
    if (season.effects.expenseMultiplier) {
      expenses *= season.effects.expenseMultiplier;
    }
  }

  return { businessRevenue, stockMarket, salaryBonus, expenses };
}
