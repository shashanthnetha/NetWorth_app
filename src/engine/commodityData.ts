// ============================================================
// NETWORTH — Gold & Commodities Data
// ============================================================

import { Commodity } from './types';

export const COMMODITIES: Commodity[] = [
  {
    id: 'physical_gold',
    name: 'Physical Gold',
    type: 'physical_gold',
    pricePerUnit: 6200,
    unit: 'gram',
    annualReturn: 0.08,
    storageCost: 0.005,
    interestRate: 0,
    maturityMonths: 0,
    priceHistory: [6200],
    description: 'Buy physical gold in grams. Traditional Indian investment. Storage costs apply.',
  },
  {
    id: 'digital_gold',
    name: 'Digital Gold',
    type: 'digital_gold',
    pricePerUnit: 6200,
    unit: 'gram',
    annualReturn: 0.08,
    storageCost: 0,
    interestRate: 0,
    maturityMonths: 0,
    priceHistory: [6200],
    description: 'Buy gold digitally. No storage costs. Instant buy/sell. Same gold price.',
  },
  {
    id: 'sgb',
    name: 'Sovereign Gold Bond',
    type: 'sgb',
    pricePerUnit: 6200,
    unit: 'gram',
    annualReturn: 0.08,
    storageCost: 0,
    interestRate: 0.025,
    maturityMonths: 96,
    priceHistory: [6200],
    description: '2.5% annual interest + gold appreciation. 8-year maturity. Tax-free on maturity.',
  },
  {
    id: 'silver',
    name: 'Silver',
    type: 'silver',
    pricePerUnit: 75,
    unit: 'gram',
    annualReturn: 0.10,
    storageCost: 0.003,
    interestRate: 0,
    maturityMonths: 0,
    priceHistory: [75],
    description: 'Higher volatility than gold. Industrial demand drives prices. Affordable entry.',
  },
];

/** Simulate commodity price changes for one month */
export function updateCommodityPrices(
  commodities: Commodity[],
  stockMarketMultiplier: number
): Commodity[] {
  return commodities.map((c) => {
    const monthlyReturn = c.annualReturn / 12;
    // Gold tends to be inverse to stock market (safe haven)
    const inverseMarket = stockMarketMultiplier < 1 ? 1.02 : stockMarketMultiplier > 1.05 ? 0.99 : 1;
    const noise = (Math.random() - 0.48) * 0.03;
    const change = 1 + monthlyReturn + noise;
    const newPrice = Math.max(c.pricePerUnit * 0.5, +(c.pricePerUnit * change * inverseMarket).toFixed(2));

    return {
      ...c,
      pricePerUnit: newPrice,
      priceHistory: [...c.priceHistory, newPrice].slice(-120),
    };
  });
}
