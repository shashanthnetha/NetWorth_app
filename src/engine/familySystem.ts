// ============================================================
// NETWORTH — Family System
// ============================================================

import { FamilyState, Kid } from './types';
import { generateId, randomBetween, randomChance, randomPick } from '../lib/utils';

const FIRST_NAMES = ['Aarav', 'Vihaan', 'Aanya', 'Diya', 'Arjun', 'Ishaan', 'Ananya', 'Saanvi', 'Riya', 'Kabir'];
const PARTNER_NAMES = ['Priya', 'Neha', 'Rahul', 'Ankit', 'Sneha', 'Pooja', 'Vikram', 'Shreya', 'Aditya', 'Kavya'];

export function createInitialFamilyState(): FamilyState {
  return {
    relationshipStatus: 'single',
    partnerName: '',
    dateMonthsElapsed: 0,
    partnerIncome: 0,
    partnerHappinessBoost: 0,
    kids: [],
    weddingCost: 0,
    hasPrenup: false,
  };
}

/** Start dating — choose a random partner */
export function startDating(family: FamilyState): FamilyState {
  return {
    ...family,
    relationshipStatus: 'dating',
    partnerName: randomPick(PARTNER_NAMES),
    dateMonthsElapsed: 0,
    partnerHappinessBoost: 15,
  };
}

/** Get married */
export function getMarried(
  family: FamilyState,
  weddingTier: 'simple' | 'standard' | 'grand' | 'royal',
  hasPrenup: boolean
): { family: FamilyState; cost: number } {
  const costs = { simple: 200000, standard: 1000000, grand: 5000000, royal: 20000000 };
  const partnerIncomes = { simple: 20000, standard: 35000, grand: 50000, royal: 80000 };

  const cost = costs[weddingTier];
  return {
    family: {
      ...family,
      relationshipStatus: 'married',
      weddingCost: cost,
      partnerIncome: partnerIncomes[weddingTier],
      partnerHappinessBoost: 20,
      hasPrenup,
    },
    cost,
  };
}

/** Have a kid */
export function haveKid(family: FamilyState): FamilyState {
  const newKid: Kid = {
    id: generateId(),
    name: randomPick(FIRST_NAMES),
    age: 0,
    monthlyCost: 10000,
    educationTier: 'none',
    educationCost: 0,
  };

  return {
    ...family,
    kids: [...family.kids, newKid],
  };
}

/** Monthly family tick — age kids, update education costs */
export function tickFamily(family: FamilyState): FamilyState {
  if (family.relationshipStatus === 'single') return family;

  let updated = { ...family };

  // Dating relationship grows
  if (updated.relationshipStatus === 'dating') {
    updated.dateMonthsElapsed += 1;
  }

  // Update kids
  updated.kids = updated.kids.map((kid) => {
    const newAge = kid.age + 1;
    let educationTier = kid.educationTier;
    let educationCost = kid.educationCost;
    let monthlyCost = kid.monthlyCost;

    // Kids auto-enter school at age 5 (60 months)
    if (newAge >= 60 && educationTier === 'none') {
      educationTier = 'school';
      educationCost = 5000;
      monthlyCost = 15000;
    }
    // College at age 18 (216 months)
    if (newAge >= 216 && educationTier === 'school') {
      educationTier = 'college';
      educationCost = 25000;
      monthlyCost = 35000;
    }
    // Costs increase slightly each year
    if (newAge % 12 === 0) {
      monthlyCost = Math.round(monthlyCost * 1.05);
      educationCost = Math.round(educationCost * 1.05);
    }

    return { ...kid, age: newAge, educationTier, educationCost, monthlyCost };
  });

  return updated;
}

/** Calculate total monthly family expenses */
export function calculateFamilyExpenses(family: FamilyState): number {
  if (family.relationshipStatus === 'single') return 0;

  let cost = 0;

  // Dating costs
  if (family.relationshipStatus === 'dating') cost += 5000;

  // Kids costs
  for (const kid of family.kids) {
    cost += kid.monthlyCost + kid.educationCost;
  }

  return cost;
}

/** Get divorce — lose assets */
export function getDivorce(family: FamilyState): { family: FamilyState; assetLossPercent: number } {
  return {
    family: {
      ...family,
      relationshipStatus: 'divorced',
      partnerIncome: 0,
      partnerHappinessBoost: -30,
      dateMonthsElapsed: 0,
    },
    assetLossPercent: family.hasPrenup ? 0.1 : 0.3,
  };
}
