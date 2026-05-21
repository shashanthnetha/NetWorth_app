// ============================================================
// NETWORTH — Forex Trading Data
// ============================================================

import { ForexPairData } from './types';

export const FOREX_PAIRS: ForexPairData[] = [
  {
    id: 'USD_INR',
    name: 'US Dollar / Indian Rupee',
    baseRate: 83.50,
    currentRate: 83.50,
    volatility: 0.003,
    spread: 0.03,
    rateHistory: [83.50],
    description: 'Most liquid INR pair. Affected by Fed policy, oil prices, FII flows.',
  },
  {
    id: 'EUR_INR',
    name: 'Euro / Indian Rupee',
    baseRate: 90.80,
    currentRate: 90.80,
    volatility: 0.004,
    spread: 0.05,
    rateHistory: [90.80],
    description: 'European trade exposure. Affected by ECB policy, EU economic data.',
  },
  {
    id: 'GBP_INR',
    name: 'British Pound / Indian Rupee',
    baseRate: 105.20,
    currentRate: 105.20,
    volatility: 0.005,
    spread: 0.06,
    rateHistory: [105.20],
    description: 'Higher volatility. Affected by BoE rates, Brexit aftereffects.',
  },
  {
    id: 'JPY_INR',
    name: 'Japanese Yen / Indian Rupee',
    baseRate: 0.56,
    currentRate: 0.56,
    volatility: 0.006,
    spread: 0.01,
    rateHistory: [0.56],
    description: 'Safe haven pair. Yen strengthens during global risk-off events.',
  },
];

export const LEVERAGE_OPTIONS = [10, 20, 30, 50] as const;

/** Simulate forex rate changes for one month (5 intra-month ticks) */
export function updateForexRates(
  pairs: ForexPairData[],
  globalVolatility: number
): ForexPairData[] {
  return pairs.map((pair) => {
    let rate = pair.currentRate;
    // 5 intra-month micro-movements
    for (let i = 0; i < 5; i++) {
      const move = (Math.random() - 0.5) * 2 * pair.volatility * rate * (1 + globalVolatility * 0.01);
      rate = Math.max(pair.baseRate * 0.7, rate + move);
    }
    rate = +rate.toFixed(4);

    return {
      ...pair,
      currentRate: rate,
      rateHistory: [...pair.rateHistory, rate].slice(-120),
    };
  });
}

/** Calculate P&L for an open forex position */
export function calculateForexPnL(
  position: { type: 'long' | 'short'; entryRate: number; currentRate: number; lotSize: number; leverage: number }
): number {
  const direction = position.type === 'long' ? 1 : -1;
  const pips = (position.currentRate - position.entryRate) * direction;
  return Math.round(pips * position.lotSize * position.leverage);
}
