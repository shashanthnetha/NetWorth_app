// ============================================================
// NETWORTH — Startup System
// ============================================================

import { StartupTemplate, OwnedStartup, StartupStage } from './types';
import { randomBetween, randomChance, generateId } from '../lib/utils';

export const STARTUP_TEMPLATES: StartupTemplate[] = [
  {
    id: 'startup_fintech',
    name: 'FinTech Startup',
    sector: 'fintech',
    description: 'Build a UPI/payments or lending platform. High regulatory risk, massive market.',
    initialCost: 500000,
    monthlyBurn: 80000,
    marketFitProbability: 0.25,
    revenueGrowthRate: 0.15,
    requirements: { cash: 500000, skills: { technical: 5, finance: 3 } },
  },
  {
    id: 'startup_edtech',
    name: 'EdTech Platform',
    sector: 'edtech',
    description: 'Online learning platform. Lower burn, steady growth. Competitive market.',
    initialCost: 300000,
    monthlyBurn: 50000,
    marketFitProbability: 0.30,
    revenueGrowthRate: 0.12,
    requirements: { cash: 300000, skills: { technical: 4, communication: 3 } },
  },
  {
    id: 'startup_healthtech',
    name: 'HealthTech Solution',
    sector: 'healthtech',
    description: 'Telemedicine or health data platform. Long sales cycles, high impact.',
    initialCost: 700000,
    monthlyBurn: 100000,
    marketFitProbability: 0.20,
    revenueGrowthRate: 0.10,
    requirements: { cash: 700000, skills: { technical: 5, business: 3 } },
  },
  {
    id: 'startup_ai',
    name: 'AI/ML Startup',
    sector: 'ai',
    description: 'AI-powered SaaS product. Hot sector, high valuations, needs top talent.',
    initialCost: 800000,
    monthlyBurn: 120000,
    marketFitProbability: 0.15,
    revenueGrowthRate: 0.20,
    requirements: { cash: 800000, skills: { technical: 7, analytics: 4 } },
  },
  {
    id: 'startup_ecommerce',
    name: 'E-Commerce Brand',
    sector: 'ecommerce',
    description: 'D2C brand with online presence. Capital-intensive, fast revenue.',
    initialCost: 400000,
    monthlyBurn: 60000,
    marketFitProbability: 0.35,
    revenueGrowthRate: 0.08,
    requirements: { cash: 400000, skills: { business: 4, marketing: 3 } },
  },
];

/** Stage progression probabilities and requirements */
const STAGE_REQUIREMENTS: Record<StartupStage, {
  nextStage: StartupStage | null;
  monthsRequired: number;
  marketFitMin: number;
  revenueMin: number;
  successProbability: number;
  valuationMultiplier: number;
}> = {
  idea: { nextStage: 'mvp', monthsRequired: 3, marketFitMin: 0, revenueMin: 0, successProbability: 0.8, valuationMultiplier: 1 },
  mvp: { nextStage: 'seed', monthsRequired: 6, marketFitMin: 20, revenueMin: 10000, successProbability: 0.5, valuationMultiplier: 3 },
  seed: { nextStage: 'series_a', monthsRequired: 12, marketFitMin: 40, revenueMin: 100000, successProbability: 0.3, valuationMultiplier: 5 },
  series_a: { nextStage: 'series_b', monthsRequired: 18, marketFitMin: 60, revenueMin: 500000, successProbability: 0.25, valuationMultiplier: 8 },
  series_b: { nextStage: 'ipo', monthsRequired: 24, marketFitMin: 80, revenueMin: 2000000, successProbability: 0.2, valuationMultiplier: 15 },
  ipo: { nextStage: null, monthsRequired: 0, marketFitMin: 0, revenueMin: 0, successProbability: 1, valuationMultiplier: 25 },
  acquired: { nextStage: null, monthsRequired: 0, marketFitMin: 0, revenueMin: 0, successProbability: 1, valuationMultiplier: 10 },
  failed: { nextStage: null, monthsRequired: 0, marketFitMin: 0, revenueMin: 0, successProbability: 0, valuationMultiplier: 0 },
};

/** Create a new startup from template */
export function createStartup(template: StartupTemplate, playerName: string): OwnedStartup {
  return {
    id: generateId(),
    templateId: template.id,
    name: `${playerName}'s ${template.name}`,
    sector: template.sector,
    stage: 'idea',
    monthsRunning: 0,
    revenue: 0,
    monthlyBurn: template.monthlyBurn,
    valuation: template.initialCost * 2,
    equity: 100,
    employees: 1,
    productQuality: 20,
    marketFit: 0,
    fundingRaised: 0,
    runway: Math.floor(template.initialCost / template.monthlyBurn),
  };
}

/** Simulate one month of startup operations */
export function tickStartup(startup: OwnedStartup): OwnedStartup {
  if (startup.stage === 'failed' || startup.stage === 'ipo' || startup.stage === 'acquired') {
    return startup;
  }

  const updated = { ...startup, monthsRunning: startup.monthsRunning + 1 };

  // Market fit grows slowly with randomness
  const fitGrowth = randomBetween(0.5, 3) * (updated.productQuality / 50);
  updated.marketFit = Math.min(100, updated.marketFit + fitGrowth);

  // Product quality improves with team size
  const qualityGrowth = randomBetween(0.2, 1.5) * Math.sqrt(updated.employees);
  updated.productQuality = Math.min(100, updated.productQuality + qualityGrowth);

  // Revenue grows based on market fit and stage
  if (updated.marketFit > 15) {
    const template = STARTUP_TEMPLATES.find((t) => t.id === updated.templateId);
    const growthRate = template?.revenueGrowthRate || 0.10;
    const baseGrowth = updated.revenue > 0 ? updated.revenue * growthRate : 5000;
    updated.revenue = Math.round(updated.revenue + baseGrowth * (updated.marketFit / 50));
  }

  // Monthly burn increases with employees
  updated.monthlyBurn = Math.round(startup.monthlyBurn * (1 + (updated.employees - 1) * 0.3));

  // Update valuation
  const stageReq = STAGE_REQUIREMENTS[updated.stage];
  const annualRevenue = updated.revenue * 12;
  updated.valuation = Math.max(
    updated.fundingRaised + 500000,
    Math.round(annualRevenue * stageReq.valuationMultiplier)
  );

  // Runway calculation
  const netBurn = updated.monthlyBurn - updated.revenue;
  updated.runway = netBurn > 0 ? Math.max(0, Math.floor(updated.fundingRaised / netBurn)) : 999;

  // Failure check: runway hits 0 with no revenue
  if (updated.runway <= 0 && updated.revenue < updated.monthlyBurn * 0.5) {
    if (randomChance(0.4)) {
      updated.stage = 'failed';
    }
  }

  return updated;
}

/** Attempt to raise funding (dilutes equity) */
export function raiseFunding(
  startup: OwnedStartup,
  amount: number,
  equityGiven: number
): OwnedStartup {
  return {
    ...startup,
    fundingRaised: startup.fundingRaised + amount,
    equity: Math.max(10, startup.equity - equityGiven),
    valuation: Math.round(amount / (equityGiven / 100)),
    runway: Math.floor((startup.fundingRaised + amount) / startup.monthlyBurn),
  };
}

/** Check if startup can advance to next stage */
export function canAdvanceStage(startup: OwnedStartup): boolean {
  const req = STAGE_REQUIREMENTS[startup.stage];
  if (!req.nextStage) return false;
  return (
    startup.monthsRunning >= req.monthsRequired &&
    startup.marketFit >= req.marketFitMin &&
    startup.revenue >= req.revenueMin
  );
}

/** Try to advance stage (probabilistic) */
export function tryAdvanceStage(startup: OwnedStartup): OwnedStartup {
  const req = STAGE_REQUIREMENTS[startup.stage];
  if (!canAdvanceStage(startup)) return startup;

  if (randomChance(req.successProbability)) {
    return { ...startup, stage: req.nextStage! };
  }
  return startup;
}
