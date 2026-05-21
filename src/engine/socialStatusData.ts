// ============================================================
// NETWORTH — Social Status Data
// ============================================================

import { StatusItem } from './types';

export const STATUS_ITEMS: StatusItem[] = [
  // --- Vehicles (tier 1-7) ---
  {
    id: 'vehicle_bicycle', name: 'Bicycle', category: 'vehicle', tier: 1,
    cost: 5000, monthlyCost: 0, reputationBoost: 1, happinessBoost: 3,
    description: 'Eco-friendly. Basic transportation.', icon: '🚲',
  },
  {
    id: 'vehicle_scooter', name: 'Scooter', category: 'vehicle', tier: 2,
    cost: 80000, monthlyCost: 1500, reputationBoost: 3, happinessBoost: 5,
    description: 'Affordable commuting. Low fuel costs.', icon: '🛵',
  },
  {
    id: 'vehicle_hatchback', name: 'Hatchback Car', category: 'vehicle', tier: 3,
    cost: 500000, monthlyCost: 5000, reputationBoost: 5, happinessBoost: 8,
    description: 'Your first car! A major milestone.', icon: '🚙',
  },
  {
    id: 'vehicle_sedan', name: 'Sedan', category: 'vehicle', tier: 4,
    cost: 1200000, monthlyCost: 8000, reputationBoost: 8, happinessBoost: 12,
    description: 'Comfortable ride. Shows you\'re doing well.', icon: '🚗',
  },
  {
    id: 'vehicle_suv', name: 'SUV', category: 'vehicle', tier: 5,
    cost: 2500000, monthlyCost: 12000, reputationBoost: 12, happinessBoost: 15,
    description: 'Commanding road presence. Family-friendly.', icon: '🚙',
  },
  {
    id: 'vehicle_luxury', name: 'Luxury Car', category: 'vehicle', tier: 6,
    cost: 8000000, monthlyCost: 25000, reputationBoost: 20, happinessBoost: 20,
    description: 'BMW, Mercedes, or Audi. Ultimate status symbol.', icon: '🏎️',
  },
  {
    id: 'vehicle_supercar', name: 'Supercar', category: 'vehicle', tier: 7,
    cost: 30000000, monthlyCost: 80000, reputationBoost: 35, happinessBoost: 25,
    description: 'Lamborghini, Ferrari. You\'ve made it.', icon: '🏎️',
  },
  // --- Watches (tier 1-5) ---
  {
    id: 'watch_basic', name: 'Basic Watch', category: 'watch', tier: 1,
    cost: 2000, monthlyCost: 0, reputationBoost: 1, happinessBoost: 2,
    description: 'Tells time. That\'s it.', icon: '⌚',
  },
  {
    id: 'watch_smart', name: 'Smart Watch', category: 'watch', tier: 2,
    cost: 15000, monthlyCost: 0, reputationBoost: 3, happinessBoost: 5,
    description: 'Apple Watch or Samsung. Health tracking + notifications.', icon: '⌚',
  },
  {
    id: 'watch_premium', name: 'Premium Watch', category: 'watch', tier: 3,
    cost: 100000, monthlyCost: 0, reputationBoost: 8, happinessBoost: 8,
    description: 'Tissot, Tag Heuer. Serious upgrade.', icon: '⌚',
  },
  {
    id: 'watch_luxury', name: 'Luxury Watch', category: 'watch', tier: 4,
    cost: 500000, monthlyCost: 0, reputationBoost: 15, happinessBoost: 12,
    description: 'Omega, IWC. Collectors\' piece.', icon: '⌚',
  },
  {
    id: 'watch_rolex', name: 'Rolex', category: 'watch', tier: 5,
    cost: 1500000, monthlyCost: 0, reputationBoost: 25, happinessBoost: 15,
    description: 'The ultimate flex. Everyone notices.', icon: '⌚',
  },
  // --- Clothing (tier 1-4) ---
  {
    id: 'clothing_budget', name: 'Budget Clothing', category: 'clothing', tier: 1,
    cost: 0, monthlyCost: 1000, reputationBoost: 0, happinessBoost: 0,
    description: 'Local brands. Gets the job done.', icon: '👕',
  },
  {
    id: 'clothing_branded', name: 'Branded Clothing', category: 'clothing', tier: 2,
    cost: 0, monthlyCost: 5000, reputationBoost: 5, happinessBoost: 5,
    description: 'Nike, Zara, H&M. Look presentable.', icon: '👔',
  },
  {
    id: 'clothing_designer', name: 'Designer Clothing', category: 'clothing', tier: 3,
    cost: 0, monthlyCost: 20000, reputationBoost: 12, happinessBoost: 10,
    description: 'Gucci, Louis Vuitton. Walk into any room with confidence.', icon: '👗',
  },
  {
    id: 'clothing_haute', name: 'Haute Couture', category: 'clothing', tier: 4,
    cost: 0, monthlyCost: 100000, reputationBoost: 25, happinessBoost: 15,
    description: 'Custom-made luxury. You ARE fashion.', icon: '🎩',
  },
];

/** Calculate total flex score from owned items */
export function calculateFlexScore(ownedItems: string[]): number {
  return STATUS_ITEMS
    .filter((item) => ownedItems.includes(item.id))
    .reduce((sum, item) => sum + item.tier * 10 + item.reputationBoost, 0);
}

/** Calculate total monthly status maintenance cost */
export function calculateStatusMonthlyCost(ownedItems: string[]): number {
  return STATUS_ITEMS
    .filter((item) => ownedItems.includes(item.id))
    .reduce((sum, item) => sum + item.monthlyCost, 0);
}
