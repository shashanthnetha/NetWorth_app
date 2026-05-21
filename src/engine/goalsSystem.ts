// ============================================================
// NETWORTH — Financial Goals System
// ============================================================

import { FinancialGoal, GameState } from './types';
import { generateId } from '../lib/utils';

/** Pre-built goal templates */
export const GOAL_TEMPLATES: Omit<FinancialGoal, 'id' | 'currentProgress' | 'startMonth' | 'isCompleted'>[] = [
  {
    title: 'Emergency Fund',
    category: 'savings',
    targetAmount: 300000,
    targetMonth: 12,
    icon: '🛟',
    reward: 30,
  },
  {
    title: 'First ₹10 Lakh',
    category: 'savings',
    targetAmount: 1000000,
    targetMonth: 24,
    icon: '💰',
    reward: 50,
  },
  {
    title: 'Buy a Car',
    category: 'lifestyle',
    targetAmount: 500000,
    targetMonth: 18,
    icon: '🚗',
    reward: 40,
  },
  {
    title: '₹1 Crore Net Worth',
    category: 'investment',
    targetAmount: 10000000,
    targetMonth: 60,
    icon: '🏆',
    reward: 150,
  },
  {
    title: 'Passive Income ₹1L/month',
    category: 'income',
    targetAmount: 100000,
    targetMonth: 48,
    icon: '💸',
    reward: 100,
  },
  {
    title: 'Retirement Corpus',
    category: 'savings',
    targetAmount: 50000000,
    targetMonth: 240,
    icon: '🏖️',
    reward: 500,
  },
  {
    title: 'Debt Free',
    category: 'savings',
    targetAmount: 0,
    targetMonth: 36,
    icon: '🆓',
    reward: 80,
  },
  {
    title: 'Start a Business',
    category: 'lifestyle',
    targetAmount: 200000,
    targetMonth: 12,
    icon: '🏢',
    reward: 50,
  },
];

/** Create a goal from template */
export function createGoalFromTemplate(
  template: typeof GOAL_TEMPLATES[number],
  currentMonth: number
): FinancialGoal {
  return {
    ...template,
    id: generateId(),
    currentProgress: 0,
    startMonth: currentMonth,
    targetMonth: currentMonth + template.targetMonth,
    isCompleted: false,
  };
}

/** Create a custom goal */
export function createCustomGoal(
  title: string,
  targetAmount: number,
  currentMonth: number,
  deadlineMonths: number
): FinancialGoal {
  return {
    id: generateId(),
    title,
    category: 'custom',
    targetAmount,
    currentProgress: 0,
    targetMonth: currentMonth + deadlineMonths,
    startMonth: currentMonth,
    isCompleted: false,
    icon: '🎯',
    reward: Math.round(targetAmount / 100000) * 10,
  };
}

/** Update goal progress based on game state */
export function updateGoalProgress(
  goals: FinancialGoal[],
  state: GameState
): FinancialGoal[] {
  return goals.map((goal) => {
    if (goal.isCompleted) return goal;

    let progress = 0;

    switch (goal.category) {
      case 'savings':
        if (goal.title === 'Debt Free') {
          progress = state.loans.length === 0 ? 1 : 0;
        } else {
          progress = state.player.cash / Math.max(1, goal.targetAmount);
        }
        break;
      case 'investment':
        progress = state.player.netWorth / Math.max(1, goal.targetAmount);
        break;
      case 'income':
        progress = state.player.monthlyIncome / Math.max(1, goal.targetAmount);
        break;
      case 'lifestyle':
        progress = state.player.cash / Math.max(1, goal.targetAmount);
        break;
      case 'custom':
        progress = state.player.netWorth / Math.max(1, goal.targetAmount);
        break;
    }

    const currentProgress = Math.min(1, progress);
    const isCompleted = currentProgress >= 1;

    return { ...goal, currentProgress, isCompleted };
  });
}
