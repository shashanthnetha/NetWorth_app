// ============================================================
// NETWORTH — Challenge System
// ============================================================

import { Challenge, GameState } from './types';
import { generateId, randomPick, randomInt } from '../lib/utils';

interface ChallengeTemplate {
  title: string;
  description: string;
  metric: Challenge['condition']['metric'];
  target: number;
  reward: number;
  icon: string;
}

const DAILY_TEMPLATES: ChallengeTemplate[] = [
  { title: 'Investor', description: 'Invest ₹10K in stocks', metric: 'investment', target: 10000, reward: 5, icon: '📈' },
  { title: 'Saver', description: 'Save ₹5K cash', metric: 'savings', target: 5000, reward: 5, icon: '🐷' },
  { title: 'Earner', description: 'Earn ₹20K income', metric: 'income', target: 20000, reward: 5, icon: '💰' },
];

const WEEKLY_TEMPLATES: ChallengeTemplate[] = [
  { title: 'Portfolio Builder', description: 'Buy 3 different stocks', metric: 'stocks_bought', target: 3, reward: 20, icon: '📊' },
  { title: 'Income Milestone', description: 'Earn ₹100K total income', metric: 'income', target: 100000, reward: 25, icon: '💸' },
  { title: 'Business Profit', description: 'Earn ₹50K from businesses', metric: 'business_profit', target: 50000, reward: 25, icon: '🏢' },
  { title: 'Wealth Growth', description: 'Increase net worth by ₹50K', metric: 'net_worth_gain', target: 50000, reward: 30, icon: '📈' },
];

const MONTHLY_TEMPLATES: ChallengeTemplate[] = [
  { title: 'Millionaire Month', description: 'Reach ₹10L net worth', metric: 'net_worth_gain', target: 1000000, reward: 50, icon: '🏆' },
  { title: 'Diversified Portfolio', description: 'Own 5+ different investments', metric: 'stocks_bought', target: 5, reward: 50, icon: '🎯' },
  { title: 'Business Empire', description: 'Earn ₹200K from businesses', metric: 'business_profit', target: 200000, reward: 75, icon: '🏗️' },
  { title: 'Big Earner', description: 'Total income ₹500K', metric: 'income', target: 500000, reward: 100, icon: '💎' },
];

/** Generate new challenges for the current month */
export function generateChallenges(currentMonth: number): Challenge[] {
  const challenges: Challenge[] = [];

  // 1 daily challenge
  const daily = randomPick(DAILY_TEMPLATES);
  challenges.push({
    id: generateId(),
    title: daily.title,
    description: daily.description,
    type: 'daily',
    condition: { metric: daily.metric, target: daily.target },
    reward: daily.reward,
    isCompleted: false,
    progress: 0,
    expiresMonth: currentMonth + 1,
    icon: daily.icon,
  });

  // 1 weekly challenge
  const weekly = randomPick(WEEKLY_TEMPLATES);
  challenges.push({
    id: generateId(),
    title: weekly.title,
    description: weekly.description,
    type: 'weekly',
    condition: { metric: weekly.metric, target: weekly.target },
    reward: weekly.reward,
    isCompleted: false,
    progress: 0,
    expiresMonth: currentMonth + 4,
    icon: weekly.icon,
  });

  // 1 monthly challenge (generated every 4 months)
  if (currentMonth % 4 === 1) {
    const monthly = randomPick(MONTHLY_TEMPLATES);
    challenges.push({
      id: generateId(),
      title: monthly.title,
      description: monthly.description,
      type: 'monthly',
      condition: { metric: monthly.metric, target: monthly.target },
      reward: monthly.reward,
      isCompleted: false,
      progress: 0,
      expiresMonth: currentMonth + 12,
      icon: monthly.icon,
    });
  }

  return challenges;
}

/** Update challenge progress based on current state */
export function updateChallengeProgress(
  challenges: Challenge[],
  state: GameState,
  monthlyIncome: number,
  businessProfit: number,
  netWorthChange: number
): Challenge[] {
  return challenges.map((challenge) => {
    if (challenge.isCompleted) return challenge;
    if (state.meta.currentMonth > challenge.expiresMonth) return challenge;

    let progress = 0;

    switch (challenge.condition.metric) {
      case 'income':
        progress = monthlyIncome;
        break;
      case 'investment':
        progress = state.market.holdings.reduce((s, h) => s + h.totalInvested, 0);
        break;
      case 'savings':
        progress = state.player.cash;
        break;
      case 'business_profit':
        progress = businessProfit;
        break;
      case 'stocks_bought':
        progress = state.market.holdings.length;
        break;
      case 'net_worth_gain':
        progress = Math.max(0, netWorthChange);
        break;
    }

    const isCompleted = progress >= challenge.condition.target;
    return { ...challenge, progress: Math.min(progress, challenge.condition.target), isCompleted };
  });
}
