// ============================================================
// NETWORTH — News Feed System
// ============================================================

import { NewsItem, GameState, EventType } from './types';
import { generateId, randomPick, randomChance, randomInt } from '../lib/utils';

interface NewsTemplate {
  headline: string;
  description: string;
  type: EventType;
  impact: 'positive' | 'negative' | 'neutral';
  icon: string;
}

const MARKET_NEWS: NewsTemplate[] = [
  { headline: 'AI Sector Sees Massive Investment Surge', description: 'Global AI spending expected to cross $500B this year.', type: 'market', impact: 'positive', icon: '🤖' },
  { headline: 'RBI Holds Interest Rates Steady', description: 'Central bank maintains repo rate at 6.5%, markets react positively.', type: 'market', impact: 'neutral', icon: '🏦' },
  { headline: 'Foreign Investors Pull Out ₹5,000 Cr', description: 'FII selling pressure causes Nifty to dip 2%.', type: 'market', impact: 'negative', icon: '📉' },
  { headline: 'Tech Stocks Rally on Strong Earnings', description: 'NexaAI, QuantumX report 30%+ revenue growth.', type: 'market', impact: 'positive', icon: '📈' },
  { headline: 'Crude Oil Prices Spike 15%', description: 'OPEC cuts production. Energy stocks surge, market worried.', type: 'market', impact: 'negative', icon: '🛢️' },
  { headline: 'IPO Boom: 3 New Companies List This Week', description: 'Record retail investor participation in IPOs.', type: 'market', impact: 'positive', icon: '🎉' },
  { headline: 'Crypto Market Crashes 20% Overnight', description: 'Bitcoin drops below $40K, altcoins follow.', type: 'market', impact: 'negative', icon: '💥' },
  { headline: 'Gold Hits All-Time High', description: 'Safe-haven demand pushes gold past ₹65,000/10g.', type: 'market', impact: 'positive', icon: '🥇' },
  { headline: 'Rupee Strengthens Against Dollar', description: 'INR gains 1.2% on strong GDP data.', type: 'market', impact: 'positive', icon: '💱' },
  { headline: 'Bond Yields Rise Sharply', description: 'Fixed deposits and debt funds become more attractive.', type: 'market', impact: 'neutral', icon: '📊' },
];

const ECONOMIC_NEWS: NewsTemplate[] = [
  { headline: 'India GDP Growth Beats Estimates at 7.2%', description: 'Strong consumption and investment drive growth.', type: 'global', impact: 'positive', icon: '🇮🇳' },
  { headline: 'Inflation Eases to 4.5%', description: 'Food prices stabilize, RBI likely to cut rates.', type: 'global', impact: 'positive', icon: '📉' },
  { headline: 'Unemployment Rate Falls to 5-Year Low', description: 'Job market recovers post-pandemic. IT sector hiring.', type: 'global', impact: 'positive', icon: '💼' },
  { headline: 'Global Recession Fears Mount', description: 'US Fed signals more rate hikes, markets nervous.', type: 'global', impact: 'negative', icon: '🌍' },
  { headline: 'Housing Prices Rise 12% YoY', description: 'Metro cities see unprecedented demand.', type: 'global', impact: 'neutral', icon: '🏠' },
  { headline: 'Government Announces Tax Relief', description: 'Standard deduction increased, middle class cheers.', type: 'global', impact: 'positive', icon: '🎁' },
];

const BUSINESS_NEWS: NewsTemplate[] = [
  { headline: 'Small Businesses See Record Growth', description: 'MSME sector expands 15% in current quarter.', type: 'business', impact: 'positive', icon: '🏪' },
  { headline: 'E-Commerce Festival Season Sales Hit ₹50K Cr', description: 'Record online spending during festive sales.', type: 'business', impact: 'positive', icon: '🛒' },
  { headline: 'Restaurant Industry Faces Labour Shortage', description: 'Rising wages and delivery app competition.', type: 'business', impact: 'negative', icon: '🍽️' },
  { headline: 'Startup Funding Dries Up', description: 'VC firms tighten purse strings. Down rounds increase.', type: 'business', impact: 'negative', icon: '📉' },
  { headline: 'New GST Rules Simplify Compliance', description: 'Small businesses benefit from streamlined tax filing.', type: 'business', impact: 'positive', icon: '📋' },
];

const LIFE_NEWS: NewsTemplate[] = [
  { headline: 'Healthcare Costs Rise 8% This Year', description: 'Medical inflation outpaces general inflation.', type: 'life', impact: 'negative', icon: '🏥' },
  { headline: 'Remote Work Becomes Permanent', description: 'Major tech companies adopt hybrid models.', type: 'life', impact: 'positive', icon: '🏠' },
  { headline: 'Education Costs Surge for Private Schools', description: 'Annual fee hikes of 10-15% become common.', type: 'life', impact: 'negative', icon: '🎓' },
  { headline: 'Mental Health Awareness Drives Wellness Spending', description: 'Gym and therapy subscriptions see 30% growth.', type: 'life', impact: 'neutral', icon: '🧘' },
];

/** Generate 2-3 news items for the current month */
export function generateMonthlyNews(state: GameState): NewsItem[] {
  const month = state.meta.currentMonth;
  const count = randomInt(2, 4);
  const allNews = [...MARKET_NEWS, ...ECONOMIC_NEWS, ...BUSINESS_NEWS, ...LIFE_NEWS];
  const selected: NewsItem[] = [];

  // Ensure at least 1 market news
  const marketPick = randomPick(MARKET_NEWS);
  selected.push({
    id: generateId(),
    headline: marketPick.headline,
    description: marketPick.description,
    type: marketPick.type,
    impact: marketPick.impact,
    month,
    icon: marketPick.icon,
  });

  // Random picks for remaining
  for (let i = 1; i < count; i++) {
    const pick = randomPick(allNews);
    if (!selected.find((n) => n.headline === pick.headline)) {
      selected.push({
        id: generateId(),
        headline: pick.headline,
        description: pick.description,
        type: pick.type,
        impact: pick.impact,
        month,
        icon: pick.icon,
      });
    }
  }

  return selected;
}
