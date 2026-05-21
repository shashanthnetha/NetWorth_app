// ============================================================
// NETWORTH — Mutual Fund & SIP Data
// ============================================================

import { MutualFund } from './types';

export const MUTUAL_FUNDS: MutualFund[] = [
  {
    id: 'mf_large_cap',
    name: 'BlueChip Large Cap Fund',
    category: 'large_cap',
    nav: 450,
    expenseRatio: 0.012,
    returnRate: 0.12,
    riskLevel: 2,
    lockInMonths: 0,
    minInvestment: 500,
    navHistory: [450],
    description: 'Invests in top 100 companies by market cap. Stable, lower risk.',
    isTaxSaving: false,
  },
  {
    id: 'mf_mid_cap',
    name: 'Growth Mid Cap Fund',
    category: 'mid_cap',
    nav: 280,
    expenseRatio: 0.018,
    returnRate: 0.15,
    riskLevel: 3,
    lockInMonths: 0,
    minInvestment: 500,
    navHistory: [280],
    description: 'Mid-sized companies with high growth potential. Moderate risk.',
    isTaxSaving: false,
  },
  {
    id: 'mf_small_cap',
    name: 'Momentum Small Cap Fund',
    category: 'small_cap',
    nav: 120,
    expenseRatio: 0.022,
    returnRate: 0.18,
    riskLevel: 4,
    lockInMonths: 0,
    minInvestment: 500,
    navHistory: [120],
    description: 'Small companies with explosive potential. High volatility.',
    isTaxSaving: false,
  },
  {
    id: 'mf_index',
    name: 'Nifty 50 Index Fund',
    category: 'index',
    nav: 200,
    expenseRatio: 0.005,
    returnRate: 0.11,
    riskLevel: 2,
    lockInMonths: 0,
    minInvestment: 100,
    navHistory: [200],
    description: 'Tracks Nifty 50 index. Ultra-low expense ratio. Best for passive investing.',
    isTaxSaving: false,
  },
  {
    id: 'mf_elss',
    name: 'Tax Saver ELSS Fund',
    category: 'elss',
    nav: 320,
    expenseRatio: 0.016,
    returnRate: 0.14,
    riskLevel: 3,
    lockInMonths: 36,
    minInvestment: 500,
    navHistory: [320],
    description: '3-year lock-in. Tax deduction under Section 80C (up to ₹1.5L/year).',
    isTaxSaving: true,
  },
];

/** Simulate NAV change for one month */
export function updateMutualFundNAVs(
  funds: MutualFund[],
  marketMultiplier: number
): MutualFund[] {
  return funds.map((fund) => {
    const monthlyReturn = fund.returnRate / 12;
    const noise = (Math.random() - 0.45) * fund.riskLevel * 0.02;
    const marketEffect = (marketMultiplier - 1) * 0.3;
    const change = 1 + monthlyReturn + noise + marketEffect - fund.expenseRatio / 12;
    const newNav = Math.max(fund.nav * 0.5, +(fund.nav * change).toFixed(2));

    return {
      ...fund,
      nav: newNav,
      navHistory: [...fund.navHistory, newNav].slice(-120),
    };
  });
}
