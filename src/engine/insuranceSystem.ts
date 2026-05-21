// ============================================================
// NETWORTH — Insurance System
// ============================================================

import { InsurancePolicy } from './types';

export const INSURANCE_POLICIES: InsurancePolicy[] = [
  // --- Health Insurance ---
  {
    id: 'health_basic',
    type: 'health',
    name: 'Basic Health Plan',
    monthlyPremium: 500,
    coverageAmount: 300000,
    deductible: 5000,
    coveragePercent: 0.7,
    description: 'Covers 70% of medical emergencies up to ₹3L. ₹5K deductible.',
  },
  {
    id: 'health_standard',
    type: 'health',
    name: 'Standard Health Plan',
    monthlyPremium: 1500,
    coverageAmount: 1000000,
    deductible: 2000,
    coveragePercent: 0.8,
    description: 'Covers 80% up to ₹10L. Lower deductible. Includes day care.',
  },
  {
    id: 'health_premium',
    type: 'health',
    name: 'Premium Health Plan',
    monthlyPremium: 5000,
    coverageAmount: 5000000,
    deductible: 0,
    coveragePercent: 0.95,
    description: 'Covers 95% up to ₹50L. Zero deductible. International coverage.',
  },
  // --- Life Insurance ---
  {
    id: 'life_term',
    type: 'life',
    name: 'Term Life Insurance',
    monthlyPremium: 800,
    coverageAmount: 5000000,
    deductible: 0,
    coveragePercent: 1.0,
    description: 'Pure protection. ₹50L payout on catastrophic health events.',
  },
  {
    id: 'life_endowment',
    type: 'life',
    name: 'Endowment Plan',
    monthlyPremium: 2000,
    coverageAmount: 2000000,
    deductible: 0,
    coveragePercent: 1.0,
    description: '₹20L coverage + maturity benefit. Part insurance, part savings.',
  },
  // --- Property Insurance ---
  {
    id: 'property_basic',
    type: 'property',
    name: 'Property Insurance',
    monthlyPremium: 0,      // calculated as % of property value
    coverageAmount: 0,       // matches property value
    deductible: 10000,
    coveragePercent: 0.85,
    description: 'Covers 85% of property damage from fire, flood, theft. 0.5% annual premium.',
  },
  // --- Vehicle Insurance ---
  {
    id: 'vehicle_comprehensive',
    type: 'vehicle',
    name: 'Comprehensive Vehicle Insurance',
    monthlyPremium: 0,      // calculated based on vehicle value
    coverageAmount: 0,
    deductible: 5000,
    coveragePercent: 0.9,
    description: 'Covers 90% of vehicle damage + third-party liability. Required by law.',
  },
];

/**
 * Calculate insurance payout for an event.
 * Returns the amount the player doesn't have to pay.
 */
export function calculateInsurancePayout(
  eventCost: number,
  policy: InsurancePolicy
): number {
  const afterDeductible = Math.max(0, eventCost - policy.deductible);
  const covered = Math.min(afterDeductible * policy.coveragePercent, policy.coverageAmount);
  return Math.round(covered);
}

/**
 * Calculate monthly premium for property/vehicle insurance based on asset value.
 */
export function calculateAssetPremium(
  assetValue: number,
  annualRate: number = 0.005
): number {
  return Math.round((assetValue * annualRate) / 12);
}
