// ============================================================
// NETWORTH — Event System
// ============================================================

import { GameEvent, EventType, EventSeverity, EventEffect, EventChoice, StockSector, GameState } from './types';
import { generateId, randomPick, randomChance, randomBetween } from '../lib/utils';

interface EventTemplate {
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  probability: number; // base probability per month
  effects: EventEffect[];
  choices?: EventChoice[];
  icon: string;
  conditions?: (state: GameState) => boolean;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  // ---- MARKET EVENTS ----
  {
    type: 'market',
    severity: 'moderate',
    title: 'Bull Market Rally',
    description: 'Investor confidence surges! Stock markets are on a tear with widespread gains across all sectors.',
    probability: 0.08,
    effects: [{ target: 'allStocks', value: 12, isPercentage: true }],
    icon: '📈',
  },
  {
    type: 'market',
    severity: 'major',
    title: 'Market Crash!',
    description: 'Panic selling grips the market. Stocks plummet as fear spreads. Diamond hands or paper hands?',
    probability: 0.04,
    effects: [{ target: 'allStocks', value: -25, isPercentage: true }],
    icon: '📉',
  },
  {
    type: 'market',
    severity: 'moderate',
    title: 'AI Boom!',
    description: 'AI sector explodes! NexaAI and tech companies surge on breakthrough announcements.',
    probability: 0.06,
    effects: [{ target: 'sectorStocks', value: 25, isPercentage: true, sector: 'tech' }],
    icon: '🤖',
  },
  {
    type: 'market',
    severity: 'moderate',
    title: 'Green Energy Surge',
    description: 'Government announces massive clean energy subsidies. Green stocks soar!',
    probability: 0.05,
    effects: [{ target: 'sectorStocks', value: 20, isPercentage: true, sector: 'green' }],
    icon: '🌿',
  },
  {
    type: 'market',
    severity: 'moderate',
    title: 'Crypto Winter',
    description: 'Crypto markets face massive selloff. Regulatory fears cause widespread panic.',
    probability: 0.06,
    effects: [{ target: 'sectorStocks', value: -35, isPercentage: true, sector: 'crypto' }],
    icon: '❄️',
  },
  {
    type: 'market',
    severity: 'moderate',
    title: 'Crypto Surge!',
    description: 'Institutional adoption news sends crypto soaring! FOMO is real.',
    probability: 0.05,
    effects: [{ target: 'sectorStocks', value: 40, isPercentage: true, sector: 'crypto' }],
    icon: '🚀',
  },
  {
    type: 'market',
    severity: 'minor',
    title: 'Earnings Season',
    description: 'Major companies report strong earnings. Markets react positively.',
    probability: 0.1,
    effects: [{ target: 'allStocks', value: 5, isPercentage: true }],
    icon: '📊',
  },
  {
    type: 'market',
    severity: 'minor',
    title: 'Fed Rate Decision',
    description: 'Central bank raises interest rates. Markets dip on the news.',
    probability: 0.08,
    effects: [{ target: 'allStocks', value: -8, isPercentage: true }],
    icon: '🏛️',
  },
  {
    type: 'market',
    severity: 'catastrophic',
    title: 'Black Swan Event',
    description: 'An unprecedented global crisis triggers a massive market crash. Everything is falling.',
    probability: 0.01,
    effects: [{ target: 'allStocks', value: -45, isPercentage: true }, { target: 'happiness', value: -15, isPercentage: false }],
    icon: '🦢',
  },
  {
    type: 'market',
    severity: 'moderate',
    title: 'Recovery Rally',
    description: 'Markets bounce back strongly after recent declines. Hope returns!',
    probability: 0.07,
    effects: [{ target: 'allStocks', value: 18, isPercentage: true }],
    icon: '🔄',
  },
  {
    type: 'market',
    severity: 'moderate',
    title: 'Space Industry Boom',
    description: 'Successful space missions drive investor excitement in aerospace stocks.',
    probability: 0.04,
    effects: [{ target: 'sectorStocks', value: 30, isPercentage: true, sector: 'space' }],
    icon: '🛸',
  },
  {
    type: 'market',
    severity: 'moderate',
    title: 'Biotech Breakthrough',
    description: 'Major drug approval sends biotech stocks soaring!',
    probability: 0.05,
    effects: [{ target: 'sectorStocks', value: 22, isPercentage: true, sector: 'biotech' }],
    icon: '🧬',
  },

  // ---- LIFE EVENTS ----
  {
    type: 'life',
    severity: 'moderate',
    title: 'Medical Emergency',
    description: 'An unexpected health issue requires immediate medical attention.',
    probability: 0.06,
    effects: [{ target: 'cash', value: -50000, isPercentage: false }, { target: 'health', value: -15, isPercentage: false }],
    icon: '🏥',
  },
  {
    type: 'life',
    severity: 'major',
    title: 'Serious Illness',
    description: 'A serious medical condition requires expensive treatment. Health takes a major hit.',
    probability: 0.02,
    effects: [{ target: 'cash', value: -300000, isPercentage: false }, { target: 'health', value: -30, isPercentage: false }, { target: 'happiness', value: -20, isPercentage: false }],
    icon: '😷',
  },
  {
    type: 'life',
    severity: 'moderate',
    title: 'Unexpected Inheritance',
    description: 'A distant relative leaves you a surprising inheritance!',
    probability: 0.03,
    effects: [{ target: 'cash', value: 200000, isPercentage: false }, { target: 'happiness', value: 10, isPercentage: false }],
    icon: '💌',
  },
  {
    type: 'life',
    severity: 'minor',
    title: 'Car Breakdown',
    description: 'Your vehicle needs emergency repairs. An unexpected expense.',
    probability: 0.08,
    effects: [{ target: 'cash', value: -15000, isPercentage: false }, { target: 'stress', value: 5, isPercentage: false }],
    icon: '🚗',
  },
  {
    type: 'life',
    severity: 'minor',
    title: 'Bonus at Work!',
    description: 'Your hard work gets noticed! Boss gives you an unexpected bonus.',
    probability: 0.1,
    effects: [{ target: 'cash', value: 25000, isPercentage: false }, { target: 'happiness', value: 10, isPercentage: false }, { target: 'motivation', value: 5, isPercentage: false }],
    icon: '🎁',
    conditions: (state) => state.player.currentJob !== null,
  },
  {
    type: 'life',
    severity: 'moderate',
    title: 'Tax Audit',
    description: 'The tax department is auditing your finances. Pay up!',
    probability: 0.04,
    effects: [{ target: 'cash', value: -8, isPercentage: true }, { target: 'stress', value: 10, isPercentage: false }],
    icon: '🧾',
    conditions: (state) => state.player.cash > 500000,
  },
  {
    type: 'life',
    severity: 'minor',
    title: 'Mentor Connection',
    description: 'You meet a successful mentor who shares valuable insights.',
    probability: 0.05,
    effects: [{ target: 'reputation', value: 10, isPercentage: false }, { target: 'motivation', value: 10, isPercentage: false }],
    icon: '🧠',
    conditions: (state) => state.player.stats.reputation > 30,
  },
  {
    type: 'life',
    severity: 'major',
    title: 'Burnout',
    description: 'You\'ve been pushing too hard. Forced to take a break from work.',
    probability: 0.05,
    effects: [{ target: 'health', value: -10, isPercentage: false }, { target: 'energy', value: -30, isPercentage: false }, { target: 'happiness', value: -15, isPercentage: false }],
    icon: '😵',
    conditions: (state) => (state.player.stats.energy < 30),
  },
  {
    type: 'life',
    severity: 'moderate',
    title: 'Lucky Day!',
    description: 'Everything seems to go your way today. Small windfall!',
    probability: 0.06,
    effects: [{ target: 'cash', value: 50000, isPercentage: false }, { target: 'happiness', value: 15, isPercentage: false }],
    icon: '🍀',
  },
  {
    type: 'life',
    severity: 'minor',
    title: 'Friends Reunion',
    description: 'Old friends come to visit. Great time, small expense.',
    probability: 0.08,
    effects: [{ target: 'cash', value: -5000, isPercentage: false }, { target: 'happiness', value: 12, isPercentage: false }],
    icon: '🎉',
  },

  // ---- BUSINESS EVENTS ----
  {
    type: 'business',
    severity: 'moderate',
    title: 'Business Goes Viral!',
    description: 'Your business gets featured on social media! Revenue surges this month.',
    probability: 0.04,
    effects: [{ target: 'businessRevenue', value: 50, isPercentage: true, duration: 1 }],
    icon: '🔥',
    conditions: (state) => state.businesses.length > 0,
  },
  {
    type: 'business',
    severity: 'moderate',
    title: 'Key Employee Quits',
    description: 'Your best employee leaves for a competitor. Revenue takes a hit.',
    probability: 0.06,
    effects: [{ target: 'businessRevenue', value: -15, isPercentage: true, duration: 2 }],
    icon: '👋',
    conditions: (state) => state.businesses.length > 0,
  },
  {
    type: 'business',
    severity: 'minor',
    title: 'Negative Review',
    description: 'A bad review goes semi-viral. Slightly reduced foot traffic.',
    probability: 0.07,
    effects: [{ target: 'businessRevenue', value: -10, isPercentage: true, duration: 2 }],
    icon: '⭐',
    conditions: (state) => state.businesses.length > 0,
  },
  {
    type: 'business',
    severity: 'minor',
    title: 'Seasonal Boom',
    description: 'Holiday season drives up demand for your business!',
    probability: 0.08,
    effects: [{ target: 'businessRevenue', value: 25, isPercentage: true, duration: 1 }],
    icon: '🎄',
    conditions: (state) => state.businesses.length > 0,
  },

  // ---- GLOBAL EVENTS ----
  {
    type: 'global',
    severity: 'major',
    title: 'Recession',
    description: 'The economy enters a recession. Jobs are scarce, markets decline, businesses struggle.',
    probability: 0.03,
    effects: [
      { target: 'allStocks', value: -15, isPercentage: true },
      { target: 'businessRevenue', value: -20, isPercentage: true, duration: 3 },
      { target: 'salary', value: -10, isPercentage: true },
      { target: 'happiness', value: -10, isPercentage: false },
    ],
    icon: '📉',
  },
  {
    type: 'global',
    severity: 'moderate',
    title: 'Economic Boom',
    description: 'The economy is thriving! Higher wages, growing markets, consumer confidence soars.',
    probability: 0.05,
    effects: [
      { target: 'allStocks', value: 10, isPercentage: true },
      { target: 'businessRevenue', value: 15, isPercentage: true, duration: 2 },
      { target: 'salary', value: 5, isPercentage: true },
      { target: 'happiness', value: 5, isPercentage: false },
    ],
    icon: '🌟',
  },
  {
    type: 'global',
    severity: 'moderate',
    title: 'Inflation Spike',
    description: 'Prices are rising fast. Your living expenses increase significantly.',
    probability: 0.05,
    effects: [
      { target: 'cash', value: -20000, isPercentage: false },
      { target: 'happiness', value: -5, isPercentage: false },
    ],
    icon: '💸',
  },

  // ---- OPPORTUNITY EVENTS ----
  {
    type: 'opportunity',
    severity: 'moderate',
    title: 'Startup Pitch Opportunity',
    description: 'A friend invites you to invest in their promising startup. High risk, high reward!',
    probability: 0.04,
    choices: [
      {
        label: 'Invest ₹50,000',
        description: 'Take the risk for potential 10x returns',
        effects: [{ target: 'cash', value: -50000, isPercentage: false }],
      },
      {
        label: 'Pass',
        description: 'Play it safe this time',
        effects: [{ target: 'motivation', value: -3, isPercentage: false }],
      },
    ],
    effects: [],
    icon: '💡',
    conditions: (state) => state.player.cash > 100000,
  },
  {
    type: 'opportunity',
    severity: 'minor',
    title: 'Freelance Gig',
    description: 'Someone offers you a side project. Extra income but more work.',
    probability: 0.08,
    choices: [
      {
        label: 'Take the gig (₹20,000)',
        description: 'More money but less free time',
        effects: [{ target: 'cash', value: 20000, isPercentage: false }, { target: 'energy', value: -10, isPercentage: false }],
      },
      {
        label: 'Decline politely',
        description: 'Preserve your energy and focus',
        effects: [{ target: 'energy', value: 5, isPercentage: false }],
      },
    ],
    effects: [],
    icon: '💻',
  },
  {
    type: 'opportunity',
    severity: 'moderate',
    title: 'Job Offer',
    description: 'A recruiter reaches out with an interesting opportunity. Better pay!',
    probability: 0.06,
    effects: [{ target: 'salary', value: 15, isPercentage: true }],
    icon: '📧',
    conditions: (state) => state.player.currentJob !== null && state.player.experience > 6,
  },
];

/**
 * Generate random events for a month
 */
export function generateMonthlyEvents(state: GameState): GameEvent[] {
  const events: GameEvent[] = [];

  // Base 30% chance of ANY event per month
  if (!randomChance(0.30)) return events;

  // Filter applicable events based on conditions
  const applicableEvents = EVENT_TEMPLATES.filter(
    (template) => !template.conditions || template.conditions(state)
  );

  // Roll for each applicable event
  for (const template of applicableEvents) {
    if (randomChance(template.probability)) {
      const event: GameEvent = {
        id: generateId(),
        type: template.type,
        severity: template.severity,
        title: template.title,
        description: template.description,
        effects: template.effects,
        choices: template.choices,
        month: state.meta.currentMonth,
        icon: template.icon,
      };
      events.push(event);

      // Max 2 events per month to avoid overwhelming
      if (events.length >= 2) break;
    }
  }

  // If no event rolled but we passed the 30% check, pick a random minor one
  if (events.length === 0) {
    const minorEvents = applicableEvents.filter((e) => e.severity === 'minor');
    if (minorEvents.length > 0) {
      const template = randomPick(minorEvents);
      events.push({
        id: generateId(),
        type: template.type,
        severity: template.severity,
        title: template.title,
        description: template.description,
        effects: template.effects,
        choices: template.choices,
        month: state.meta.currentMonth,
        icon: template.icon,
      });
    }
  }

  return events;
}

/**
 * Apply event effects to state (returns partial state updates)
 */
export function applyEventEffects(
  effects: EventEffect[],
  state: GameState
): Partial<{
  cashChange: number;
  statsChanges: Partial<Record<string, number>>;
  stockMultiplier: number;
  sectorMultipliers: Partial<Record<StockSector, number>>;
  businessRevenueMultiplier: number;
  salaryMultiplier: number;
}> {
  const result: ReturnType<typeof applyEventEffects> = {
    cashChange: 0,
    statsChanges: {},
    stockMultiplier: 1,
    sectorMultipliers: {},
    businessRevenueMultiplier: 1,
    salaryMultiplier: 1,
  };

  for (const effect of effects) {
    switch (effect.target) {
      case 'cash':
        if (effect.isPercentage) {
          result.cashChange! += state.player.cash * (effect.value / 100);
        } else {
          result.cashChange! += effect.value;
        }
        break;
      case 'happiness':
      case 'health':
      case 'energy':
      case 'motivation':
      case 'reputation':
        result.statsChanges![effect.target] =
          (result.statsChanges![effect.target] || 0) + effect.value;
        break;
      case 'stress':
        // Stress reduces happiness/energy
        result.statsChanges!['happiness'] =
          (result.statsChanges!['happiness'] || 0) - effect.value;
        result.statsChanges!['energy'] =
          (result.statsChanges!['energy'] || 0) - Math.floor(effect.value / 2);
        break;
      case 'allStocks':
        result.stockMultiplier! *= 1 + effect.value / 100;
        break;
      case 'sectorStocks':
        if (effect.sector) {
          result.sectorMultipliers![effect.sector] =
            (result.sectorMultipliers![effect.sector] || 1) * (1 + effect.value / 100);
        }
        break;
      case 'businessRevenue':
        result.businessRevenueMultiplier! *= 1 + effect.value / 100;
        break;
      case 'salary':
        result.salaryMultiplier! *= 1 + effect.value / 100;
        break;
      case 'creditScore':
        // Handled directly
        break;
    }
  }

  return result;
}
