// ============================================================
// NETWORTH — Market Engine (Stock Price Simulation)
// ============================================================

import { Company, CryptoAsset, StockSector, GameState } from './types';
import { COMPANIES, CRYPTO_ASSETS, CRYPTO_BASE_PRICES } from './stockData';
import { randomBetween, clamp } from '../lib/utils';

/**
 * Initialize companies with starting prices and empty history
 */
export function initializeMarket(): { companies: Company[]; cryptoAssets: CryptoAsset[] } {
  const companies: Company[] = COMPANIES.map((c) => ({
    ...c,
    currentPrice: c.basePrice * randomBetween(0.9, 1.1),
    priceHistory: [c.basePrice],
  }));

  const cryptoAssets: CryptoAsset[] = CRYPTO_ASSETS.map((c) => ({
    ...c,
    currentPrice: CRYPTO_BASE_PRICES[c.id] * randomBetween(0.85, 1.15),
    priceHistory: [CRYPTO_BASE_PRICES[c.id]],
  }));

  return { companies, cryptoAssets };
}

/**
 * Simulate one month of stock price movements
 */
export function updateStockPrices(
  companies: Company[],
  stockMultiplier: number = 1,
  sectorMultipliers: Partial<Record<StockSector, number>> = {},
  marketTrend: 'bull' | 'bear' | 'neutral' = 'neutral'
): Company[] {
  const trendBonus =
    marketTrend === 'bull' ? 0.02 : marketTrend === 'bear' ? -0.02 : 0;

  return companies.map((company) => {
    const sectorMult = sectorMultipliers[company.sector] || 1;

    // Base random walk
    const randomChange = randomBetween(-company.volatility, company.volatility) * 0.1;

    // Growth tendency (slight upward bias for growth stocks)
    const growthChange = company.growthTendency * 0.01;

    // Combine all factors
    const totalChange =
      (randomChange + growthChange + trendBonus) * stockMultiplier * sectorMult;

    // Apply change (min price is 10% of base)
    const newPrice = clamp(
      company.currentPrice * (1 + totalChange),
      company.basePrice * 0.1,
      company.basePrice * 20
    );

    // Keep last 60 months of history
    const newHistory = [...company.priceHistory, newPrice].slice(-60);

    return {
      ...company,
      currentPrice: Math.round(newPrice * 100) / 100,
      priceHistory: newHistory,
    };
  });
}

/**
 * Simulate one month of crypto price movements (more volatile)
 */
export function updateCryptoPrices(
  cryptoAssets: CryptoAsset[],
  stockMultiplier: number = 1,
  sectorMultipliers: Partial<Record<StockSector, number>> = {}
): CryptoAsset[] {
  const cryptoMult = sectorMultipliers['crypto'] || 1;

  return cryptoAssets.map((crypto) => {
    // Crypto is more volatile than stocks
    const randomChange =
      randomBetween(-crypto.volatility, crypto.volatility) * 0.2;

    const totalChange = randomChange * stockMultiplier * cryptoMult;

    const basePrice = CRYPTO_BASE_PRICES[crypto.id] || 100;
    const newPrice = clamp(
      crypto.currentPrice * (1 + totalChange),
      basePrice * 0.01,
      basePrice * 100
    );

    const newHistory = [...crypto.priceHistory, newPrice].slice(-60);

    return {
      ...crypto,
      currentPrice: Math.round(newPrice * 100) / 100,
      priceHistory: newHistory,
    };
  });
}

/**
 * Calculate dividends for held stocks
 */
export function calculateDividends(state: GameState): number {
  let totalDividends = 0;

  for (const holding of state.market.holdings) {
    const company = state.market.companies.find((c) => c.id === holding.companyId);
    if (company && company.dividendYield > 0) {
      // Monthly dividend = (annual yield / 12) * (shares * current price)
      const monthlyDividend =
        (company.dividendYield / 12) * holding.shares * company.currentPrice;
      totalDividends += monthlyDividend;
    }
  }

  return Math.round(totalDividends);
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(state: GameState): number {
  let total = 0;

  for (const holding of state.market.holdings) {
    const company = state.market.companies.find((c) => c.id === holding.companyId);
    if (company) {
      total += holding.shares * company.currentPrice;
    }
  }

  for (const holding of state.market.cryptoHoldings) {
    const crypto = state.market.cryptoAssets.find((c) => c.id === holding.cryptoId);
    if (crypto) {
      total += holding.units * crypto.currentPrice;
    }
  }

  // Mutual Funds
  if (state.market.mutualFundHoldings) {
    for (const holding of state.market.mutualFundHoldings) {
      const fund = state.market.mutualFunds?.find((f) => f.id === holding.fundId);
      if (fund) {
        total += holding.units * fund.nav;
      }
    }
  }

  // Commodities
  if (state.market.commodityHoldings) {
    for (const holding of state.market.commodityHoldings) {
      const commodity = state.market.commodities?.find((c) => c.id === holding.commodityId);
      if (commodity) {
        total += holding.quantity * commodity.pricePerUnit;
      }
    }
  }

  // Forex Margin & P&L
  if (state.market.forexPositions) {
    for (const position of state.market.forexPositions) {
      total += position.margin + position.profitLoss;
    }
  }

  return Math.round(total);
}

/**
 * Calculate portfolio gain/loss
 */
export function calculatePortfolioGainLoss(state: GameState): {
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
} {
  let totalInvested = 0;
  let currentValue = 0;

  for (const holding of state.market.holdings) {
    totalInvested += holding.totalInvested;
    const company = state.market.companies.find((c) => c.id === holding.companyId);
    if (company) {
      currentValue += holding.shares * company.currentPrice;
    }
  }

  for (const holding of state.market.cryptoHoldings) {
    totalInvested += holding.totalInvested;
    const crypto = state.market.cryptoAssets.find((c) => c.id === holding.cryptoId);
    if (crypto) {
      currentValue += holding.units * crypto.currentPrice;
    }
  }

  const gainLoss = currentValue - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  return {
    totalInvested: Math.round(totalInvested),
    currentValue: Math.round(currentValue),
    gainLoss: Math.round(gainLoss),
    gainLossPercent: Math.round(gainLossPercent * 100) / 100,
  };
}

/**
 * Determine market trend based on recent history
 */
export function determineMarketTrend(
  companies: Company[]
): 'bull' | 'bear' | 'neutral' {
  let totalChange = 0;
  let count = 0;

  for (const company of companies) {
    if (company.priceHistory.length >= 2) {
      const prev = company.priceHistory[company.priceHistory.length - 2];
      const curr = company.currentPrice;
      totalChange += (curr - prev) / prev;
      count++;
    }
  }

  if (count === 0) return 'neutral';
  const avgChange = totalChange / count;

  if (avgChange > 0.03) return 'bull';
  if (avgChange < -0.03) return 'bear';
  return 'neutral';
}

/**
 * Simulate one day of price fluctuations for all assets
 */
export function updateMarketDaily(
  companies: Company[],
  cryptoAssets: CryptoAsset[],
  commodities: any[],
  forexPairs: any[],
  volatilityIndex: number,
  stockMultiplier: number = 1,
  sectorMultipliers: Partial<Record<StockSector, number>> = {},
  marketTrend: 'bull' | 'bear' | 'neutral' = 'neutral'
): {
  companies: Company[];
  cryptoAssets: CryptoAsset[];
  commodities: any[];
  forexPairs: any[];
} {
  const trendBonus =
    marketTrend === 'bull' ? 0.0008 : marketTrend === 'bear' ? -0.0008 : 0;

  const updatedCompanies = companies.map((company) => {
    const sectorMult = sectorMultipliers[company.sector] || 1;
    // Daily volatility is a fraction of monthly
    const dailyVolatility = company.volatility / 10;
    const randomChange = randomBetween(-dailyVolatility, dailyVolatility) * 0.06;
    const growthChange = (company.growthTendency * 0.01) / 30;

    const totalChange = (randomChange + growthChange + trendBonus) * stockMultiplier * sectorMult;

    const newPrice = clamp(
      company.currentPrice * (1 + totalChange),
      company.basePrice * 0.05,
      company.basePrice * 30
    );

    const newHistory = [...company.priceHistory, newPrice].slice(-60);

    return {
      ...company,
      currentPrice: Math.round(newPrice * 100) / 100,
      priceHistory: newHistory,
    };
  });

  const updatedCryptos = cryptoAssets.map((crypto) => {
    const cryptoMult = sectorMultipliers['crypto'] || 1;
    const dailyVolatility = crypto.volatility / 10;
    const randomChange = randomBetween(-dailyVolatility, dailyVolatility) * 0.12;
    const totalChange = randomChange * stockMultiplier * cryptoMult;

    const newPrice = clamp(
      crypto.currentPrice * (1 + totalChange),
      crypto.currentPrice * 0.2,
      crypto.currentPrice * 5.0
    );

    const newHistory = [...crypto.priceHistory, newPrice].slice(-60);

    return {
      ...crypto,
      currentPrice: Math.round(newPrice * 100) / 100,
      priceHistory: newHistory,
    };
  });

  const updatedCommodities = commodities.map((commodity) => {
    const marketInverse = marketTrend === 'bear' ? 0.0003 : marketTrend === 'bull' ? -0.0003 : 0;
    const dailyVolatility = 0.003;
    const randomChange = randomBetween(-dailyVolatility, dailyVolatility) + marketInverse;

    const newPrice = clamp(
      commodity.pricePerUnit * (1 + randomChange),
      commodity.pricePerUnit * 0.5,
      commodity.pricePerUnit * 4.0
    );

    const newHistory = [...commodity.priceHistory, newPrice].slice(-60);

    return {
      ...commodity,
      pricePerUnit: Math.round(newPrice * 100) / 100,
      priceHistory: newHistory,
    };
  });

  const updatedForex = forexPairs.map((pair) => {
    const pipsChange = randomBetween(-pair.volatility, pair.volatility) * (volatilityIndex / 30) * 0.001;
    const newRate = clamp(pair.currentRate + pipsChange, pair.baseRate * 0.8, pair.baseRate * 1.2);
    const newHistory = [...pair.rateHistory, newRate].slice(-60);

    return {
      ...pair,
      currentRate: Math.round(newRate * 10000) / 10000,
      rateHistory: newHistory,
    };
  });

  return {
    companies: updatedCompanies,
    cryptoAssets: updatedCryptos,
    commodities: updatedCommodities,
    forexPairs: updatedForex,
  };
}
