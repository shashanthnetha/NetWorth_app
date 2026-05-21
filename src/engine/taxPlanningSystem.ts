// ============================================================
// NETWORTH — Tax Planning System (Indian Tax)
// ============================================================

import { TaxPlanningState } from './types';

/** Section 80C deduction limit */
export const SECTION_80C_LIMIT = 150000;

/** Section 80D limit (health insurance premium) */
export const SECTION_80D_LIMIT = 25000;

/** NPS additional deduction under 80CCD(1B) */
export const NPS_ADDITIONAL_LIMIT = 50000;

/** PPF interest rate (annual) */
export const PPF_INTEREST_RATE = 0.071;

/** NPS expected return */
export const NPS_RETURN_RATE = 0.10;

/** Tax slabs (New Regime 2024-25, simplified) */
const TAX_SLABS = [
  { upto: 300000, rate: 0 },
  { upto: 700000, rate: 0.05 },
  { upto: 1000000, rate: 0.10 },
  { upto: 1200000, rate: 0.15 },
  { upto: 1500000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

/** Old regime slabs (with deductions) */
const OLD_REGIME_SLABS = [
  { upto: 250000, rate: 0 },
  { upto: 500000, rate: 0.05 },
  { upto: 1000000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

export function createInitialTaxState(): TaxPlanningState {
  return {
    ppfBalance: 0,
    ppfMonthlyContribution: 0,
    npsBalance: 0,
    npsMonthlyContribution: 0,
    elssInvested: 0,
    section80CUsed: 0,
    section80DUsed: 0,
    totalTaxSaved: 0,
    lastTaxFiled: 0,
  };
}

/** Calculate tax under new regime (no deductions) */
export function calculateTaxNewRegime(annualIncome: number): number {
  let tax = 0;
  let prev = 0;
  for (const slab of TAX_SLABS) {
    const taxable = Math.min(annualIncome, slab.upto) - prev;
    if (taxable > 0) tax += taxable * slab.rate;
    prev = slab.upto;
    if (annualIncome <= slab.upto) break;
  }
  // Rebate u/s 87A if income ≤ ₹7L
  if (annualIncome <= 700000) tax = 0;
  return Math.round(tax);
}

/** Calculate tax under old regime (with deductions) */
export function calculateTaxOldRegime(
  annualIncome: number,
  deductions: { section80C: number; section80D: number; nps: number; hra: number; donations80G: number }
): number {
  const totalDeductions =
    Math.min(deductions.section80C, SECTION_80C_LIMIT) +
    Math.min(deductions.section80D, SECTION_80D_LIMIT) +
    Math.min(deductions.nps, NPS_ADDITIONAL_LIMIT) +
    deductions.hra +
    deductions.donations80G * 0.5; // 50% deduction for most donations

  const taxableIncome = Math.max(0, annualIncome - totalDeductions);

  let tax = 0;
  let prev = 0;
  for (const slab of OLD_REGIME_SLABS) {
    const taxable = Math.min(taxableIncome, slab.upto) - prev;
    if (taxable > 0) tax += taxable * slab.rate;
    prev = slab.upto;
    if (taxableIncome <= slab.upto) break;
  }
  // Rebate u/s 87A if taxable income ≤ ₹5L
  if (taxableIncome <= 500000) tax = 0;
  return Math.round(tax);
}

/** Calculate optimal regime and savings */
export function calculateOptimalTax(
  annualIncome: number,
  deductions: { section80C: number; section80D: number; nps: number; hra: number; donations80G: number }
): { newRegimeTax: number; oldRegimeTax: number; savings: number; recommendOld: boolean } {
  const newTax = calculateTaxNewRegime(annualIncome);
  const oldTax = calculateTaxOldRegime(annualIncome, deductions);
  const recommendOld = oldTax < newTax;
  return {
    newRegimeTax: newTax,
    oldRegimeTax: oldTax,
    savings: Math.abs(newTax - oldTax),
    recommendOld,
  };
}

/** LTCG tax on equity (10% above ₹1L gains) */
export function calculateLTCG(gains: number): number {
  const exempted = 100000;
  const taxable = Math.max(0, gains - exempted);
  return Math.round(taxable * 0.10);
}

/** STCG tax on equity (15%) */
export function calculateSTCG(gains: number): number {
  return Math.round(Math.max(0, gains) * 0.15);
}

/** Monthly PPF interest tick */
export function tickPPF(state: TaxPlanningState): TaxPlanningState {
  const monthlyInterest = state.ppfBalance * (PPF_INTEREST_RATE / 12);
  return {
    ...state,
    ppfBalance: Math.round(state.ppfBalance + state.ppfMonthlyContribution + monthlyInterest),
    section80CUsed: Math.min(
      SECTION_80C_LIMIT,
      state.section80CUsed + state.ppfMonthlyContribution
    ),
  };
}

/** Monthly NPS tick */
export function tickNPS(state: TaxPlanningState): TaxPlanningState {
  const monthlyReturn = state.npsBalance * (NPS_RETURN_RATE / 12);
  return {
    ...state,
    npsBalance: Math.round(state.npsBalance + state.npsMonthlyContribution + monthlyReturn),
  };
}
