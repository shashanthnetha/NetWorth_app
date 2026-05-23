// ============================================================
// NETWORTH — Complete Game Type Definitions (Phase 2)
// ============================================================

// --- Core Enums ---

export type JobTier = 'entry' | 'mid' | 'high';
export type EducationTier = 'course' | 'degree' | 'elite';
export type BusinessTier = 'solo' | 'small' | 'major';
export type PropertyType = 'rental' | 'owned' | 'investment' | 'commercial' | 'land';
export type LoanType = 'personal' | 'business' | 'home' | 'education';
export type EventSeverity = 'minor' | 'moderate' | 'major' | 'catastrophic';
export type EventType = 'market' | 'life' | 'business' | 'global' | 'opportunity' | 'family' | 'season';
export type StockSector = 'tech' | 'auto' | 'energy' | 'media' | 'biotech' | 'crypto' | 'health' | 'space' | 'finance' | 'green';
export type SkillType = 'technical' | 'business' | 'communication' | 'leadership' | 'finance' | 'marketing' | 'analytics';

export type ScreenType = 'dashboard' | 'career' | 'invest' | 'empire' | 'finance' | 'profile';

// Phase 2 enums
export type MutualFundCategory = 'large_cap' | 'mid_cap' | 'small_cap' | 'index' | 'elss';
export type CommodityType = 'physical_gold' | 'digital_gold' | 'sgb' | 'silver';
export type InsuranceType = 'health' | 'life' | 'property' | 'vehicle';
export type ForexPair = 'USD_INR' | 'EUR_INR' | 'GBP_INR' | 'JPY_INR';
export type StartupStage = 'idea' | 'mvp' | 'seed' | 'series_a' | 'series_b' | 'ipo' | 'acquired' | 'failed';
export type StartupSector = 'fintech' | 'edtech' | 'healthtech' | 'ai' | 'ecommerce';
export type SideHustleType = 'freelance' | 'content' | 'gig' | 'consulting';
export type StatusCategory = 'vehicle' | 'watch' | 'clothing';
export type RelationshipStatus = 'single' | 'dating' | 'married' | 'divorced';
export type ChallengeType = 'daily' | 'weekly' | 'monthly';
export type SeasonType = 'diwali' | 'budget_day' | 'ipo_season' | 'monsoon' | 'black_friday' | 'year_end';
export type GoalCategory = 'savings' | 'investment' | 'income' | 'lifestyle' | 'custom';

// --- Player Stats ---

export interface LifeStats {
  happiness: number;    // 0-100, starts 50
  health: number;       // 0-100, starts 80
  energy: number;       // 0-100, starts 60
  motivation: number;   // 0-100, starts 70
  reputation: number;   // 0-100, starts 30
}

// --- Job System ---

export interface Job {
  id: string;
  title: string;
  tier: JobTier;
  salary: number;
  stressLevel: number;
  workHours: number;
  experienceGain: number;
  requirements: {
    education: string[];
    skills: Partial<Record<SkillType, number>>;
    experience: number;
    creditScore?: number;
  };
  promotionChance: number;
  nextJobId?: string;
  description: string;
  icon: string;
}

export interface PlayerJob {
  jobId: string;
  monthsWorked: number;
  performance: number;
  lastPromotionCheck: number;
}

// --- Education System ---

export interface Education {
  id: string;
  name: string;
  tier: EducationTier;
  cost: number;
  costPerMonth: number;
  duration: number;
  skillBoosts: Partial<Record<SkillType, number>>;
  salaryMultiplier: number;
  unlocksJobs: string[];
  prerequisites: string[];
  description: string;
  icon: string;
}

export interface ActiveEducation {
  educationId: string;
  monthsCompleted: number;
  totalMonths: number;
  isCompleted: boolean;
}

// --- Stock Market ---

export interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: StockSector;
  basePrice: number;
  currentPrice: number;
  volatility: number;
  dividendYield: number;
  growthTendency: number;
  description: string;
  priceHistory: number[];
  icon: string;
}

export interface StockHolding {
  companyId: string;
  shares: number;
  avgBuyPrice: number;
  totalInvested: number;
}

export interface CryptoAsset {
  id: string;
  name: string;
  ticker: string;
  currentPrice: number;
  volatility: number;
  priceHistory: number[];
  description: string;
}

export interface CryptoHolding {
  cryptoId: string;
  units: number;
  avgBuyPrice: number;
  totalInvested: number;
}

// --- Mutual Funds (NEW) ---

export interface MutualFund {
  id: string;
  name: string;
  category: MutualFundCategory;
  nav: number;
  expenseRatio: number;     // annual % (e.g., 0.015 = 1.5%)
  returnRate: number;       // expected annual return
  riskLevel: number;        // 1-5
  lockInMonths: number;     // 0 for no lock-in, 36 for ELSS
  minInvestment: number;
  navHistory: number[];
  description: string;
  isTaxSaving: boolean;
}

export interface MutualFundHolding {
  fundId: string;
  units: number;
  avgNav: number;
  totalInvested: number;
  purchaseMonth: number;
}

export interface SIPInvestment {
  id: string;
  fundId: string;
  monthlyAmount: number;
  startMonth: number;
  isActive: boolean;
  totalInvested: number;
  unitsAccumulated: number;
}

// --- Gold & Commodities (NEW) ---

export interface Commodity {
  id: string;
  name: string;
  type: CommodityType;
  pricePerUnit: number;    // per gram for gold/silver
  unit: string;            // 'gram', 'unit'
  annualReturn: number;
  storageCost: number;     // annual % cost (0 for digital)
  interestRate: number;    // for SGBs
  maturityMonths: number;  // 0 for no maturity
  priceHistory: number[];
  description: string;
}

export interface CommodityHolding {
  commodityId: string;
  quantity: number;
  avgBuyPrice: number;
  totalInvested: number;
  purchaseMonth: number;
}

// --- Insurance (NEW) ---

export interface InsurancePolicy {
  id: string;
  type: InsuranceType;
  name: string;
  monthlyPremium: number;
  coverageAmount: number;
  deductible: number;
  coveragePercent: number;  // 0.8 = covers 80% after deductible
  description: string;
}

export interface ActiveInsurance {
  policyId: string;
  startMonth: number;
  totalPremiumPaid: number;
  claimsCount: number;
  totalClaimedAmount: number;
}

// --- Forex Trading (NEW) ---

export interface ForexPairData {
  id: ForexPair;
  name: string;
  baseRate: number;       // e.g., 83.5 for USD/INR
  currentRate: number;
  volatility: number;     // daily pip range
  spread: number;         // broker spread in pips
  rateHistory: number[];
  description: string;
}

export interface ForexPosition {
  id: string;
  pairId: ForexPair;
  type: 'long' | 'short';
  entryRate: number;
  currentRate: number;
  lotSize: number;        // in base currency units
  leverage: number;       // 10x-50x
  margin: number;         // player's cash locked
  profitLoss: number;
  openMonth: number;
  stopLoss?: number;
  takeProfit?: number;
}

// --- Startup System (NEW) ---

export interface StartupTemplate {
  id: string;
  name: string;
  sector: StartupSector;
  description: string;
  initialCost: number;
  monthlyBurn: number;
  marketFitProbability: number;
  revenueGrowthRate: number;
  requirements: {
    cash: number;
    skills: Partial<Record<SkillType, number>>;
  };
}

export interface OwnedStartup {
  id: string;
  templateId: string;
  name: string;
  sector: StartupSector;
  stage: StartupStage;
  monthsRunning: number;
  revenue: number;
  monthlyBurn: number;
  valuation: number;
  equity: number;           // player's equity % (100 initially, dilutes)
  employees: number;
  productQuality: number;   // 0-100
  marketFit: number;        // 0-100
  fundingRaised: number;
  runway: number;           // months until cash runs out
}

// --- Side Hustles (NEW) ---

export interface SideHustle {
  id: string;
  name: string;
  type: SideHustleType;
  baseIncome: number;          // monthly
  variability: number;         // 0-1, income fluctuation
  hoursPerWeek: number;
  energyCost: number;
  requirements: {
    skills: Partial<Record<SkillType, number>>;
    reputation?: number;
    experience?: number;
  };
  growthRate: number;          // monthly growth if maintained
  description: string;
  icon: string;
}

export interface ActiveSideHustle {
  hustleId: string;
  monthsActive: number;
  currentIncome: number;
  totalEarned: number;
}

// --- Social Status (NEW) ---

export interface StatusItem {
  id: string;
  name: string;
  category: StatusCategory;
  tier: number;               // 1-7
  cost: number;
  monthlyCost: number;        // maintenance, fuel, etc.
  reputationBoost: number;
  happinessBoost: number;
  description: string;
  icon: string;
}

// --- Family System (NEW) ---

export interface FamilyState {
  relationshipStatus: RelationshipStatus;
  partnerName: string;
  dateMonthsElapsed: number;
  partnerIncome: number;
  partnerHappinessBoost: number;
  kids: Kid[];
  weddingCost: number;
  hasPrenup: boolean;
}

export interface Kid {
  id: string;
  name: string;
  age: number;            // in months
  monthlyCost: number;
  educationTier: 'none' | 'school' | 'college' | 'abroad';
  educationCost: number;
}

// --- Tax Planning (NEW) ---

export interface TaxDeduction {
  id: string;
  section: string;        // '80C', '80D', '80G', 'NPS'
  name: string;
  amount: number;
  maxLimit: number;
  description: string;
}

export interface TaxPlanningState {
  ppfBalance: number;
  ppfMonthlyContribution: number;
  npsBalance: number;
  npsMonthlyContribution: number;
  elssInvested: number;
  section80CUsed: number;
  section80DUsed: number;
  totalTaxSaved: number;
  lastTaxFiled: number;
}

// --- Financial Goals (NEW) ---

export interface FinancialGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentProgress: number;
  targetMonth: number;      // deadline month
  startMonth: number;
  isCompleted: boolean;
  icon: string;
  reward: number;           // wealth tokens
}

// --- News Feed (NEW) ---

export interface NewsItem {
  id: string;
  headline: string;
  description: string;
  type: EventType;
  impact: 'positive' | 'negative' | 'neutral';
  month: number;
  icon: string;
}

// --- Networking (NEW) ---

export interface NetworkingEvent {
  id: string;
  name: string;
  cost: number;
  reputationRequired: number;
  reputationGain: number;
  outcomes: NetworkingOutcome[];
  description: string;
  icon: string;
}

export interface NetworkingOutcome {
  label: string;
  probability: number;
  effects: {
    reputation?: number;
    cash?: number;
    happiness?: number;
    businessLead?: string;
    jobOffer?: string;
  };
}

// --- Challenges (NEW) ---

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  condition: {
    metric: 'income' | 'investment' | 'savings' | 'business_profit' | 'stocks_bought' | 'net_worth_gain';
    target: number;
  };
  reward: number;
  isCompleted: boolean;
  progress: number;
  expiresMonth: number;
  icon: string;
}

// --- Seasons (NEW) ---

export interface SeasonalEffect {
  id: SeasonType;
  name: string;
  month: number;             // which month of the year (1-12)
  duration: number;          // months
  effects: {
    businessRevenueMultiplier?: number;
    stockMarketMultiplier?: number;
    salaryBonus?: number;
    expenseMultiplier?: number;
    taxChanges?: number;
  };
  description: string;
  icon: string;
}

// --- Market Orders (NEW) ---

export interface MarketOrder {
  id: string;
  companyId: string;
  type: 'limit_buy' | 'limit_sell' | 'stop_loss';
  targetPrice: number;
  shares: number;
  createdMonth: number;
  expiresMonth: number;
}

// --- Donations (NEW) ---

export interface DonationRecord {
  id: string;
  cause: string;
  amount: number;
  month: number;
  taxDeductionPercent: number;
  reputationGain: number;
}

// --- Business System ---

export interface BusinessTemplate {
  id: string;
  name: string;
  tier: BusinessTier;
  startupCost: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  description: string;
  requirements: {
    cash: number;
    education?: string[];
    skills?: Partial<Record<SkillType, number>>;
    reputation?: number;
  };
  upgrades: BusinessUpgrade[];
  maxLevel: number;
  riskFactor: number;
  icon: string;
}

export interface BusinessUpgrade {
  id: string;
  name: string;
  cost: number;
  revenueBoost: number;
  expenseReduction: number;
  description: string;
}

export interface OwnedBusiness {
  id: string;
  templateId: string;
  name: string;
  level: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthsOwned: number;
  totalProfit: number;
  purchasedUpgrades: string[];
  employees: number;
  health: number;
  consecutiveLossMonths: number;
}

// --- Real Estate ---

export interface PropertyTemplate {
  id: string;
  name: string;
  type: PropertyType;
  purchasePrice: number;
  monthlyRent: number;
  appreciation: number;
  maintenanceCost: number;
  propertyTax: number;
  happinessBoost: number;
  description: string;
  requirements: {
    cash?: number;
    creditScore?: number;
    netWorth?: number;
  };
  icon: string;
}

export interface OwnedProperty {
  id: string;
  templateId: string;
  purchasePrice: number;
  currentValue: number;
  monthsOwned: number;
  isPlayerHome: boolean;
  monthlyRentIncome: number;
  mortgageId?: string;
}

// --- Banking ---

export interface Loan {
  id: string;
  type: LoanType;
  principal: number;
  remainingAmount: number;
  interestRate: number;
  monthlyEMI: number;
  totalMonths: number;
  monthsPaid: number;
  missedPayments: number;
  description: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  used: number;
  interestRate: number;
  cashbackRate: number;
  annualFee: number;
  rewardsPoints: number;
  minPayment: number;
}

// --- Events ---

export interface GameEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  effects: EventEffect[];
  choices?: EventChoice[];
  month: number;
  icon: string;
}

export interface EventEffect {
  target: 'cash' | 'happiness' | 'health' | 'stress' | 'reputation' |
          'motivation' | 'creditScore' | 'allStocks' | 'sectorStocks' |
          'businessRevenue' | 'salary' | 'energy';
  value: number;
  isPercentage: boolean;
  sector?: StockSector;
  duration?: number;
}

export interface EventChoice {
  label: string;
  description: string;
  effects: EventEffect[];
}

// --- Achievements ---

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  category: 'wealth' | 'business' | 'investment' | 'life' | 'career' | 'family' | 'startup' | 'status';
  condition: {
    type: 'netWorth' | 'cash' | 'businesses' | 'stocks' | 'job' |
          'education' | 'debtFree' | 'monthsPlayed' | 'portfolioGain' |
          'startup_ipo' | 'family_married' | 'status_tier' | 'donation_total' |
          'sip_count' | 'gold_holdings' | 'side_hustles' | 'goals_completed';
    value: number;
  };
  isUnlocked: boolean;
  unlockedAt?: number;
}

// --- Lifestyle Choices ---

export interface LifestyleChoice {
  id: string;
  name: string;
  monthlyCost: number;
  effects: Partial<LifeStats>;
  description: string;
  icon: string;
}

// --- Monthly Summary ---

export interface MonthlySummary {
  month: number;
  income: {
    salary: number;
    businessProfit: number;
    dividends: number;
    rentalIncome: number;
    sideHustleIncome: number;
    partnerIncome: number;
    other: number;
    total: number;
  };
  expenses: {
    housing: number;
    loanEMIs: number;
    creditCardPayments: number;
    education: number;
    lifestyle: number;
    taxes: number;
    insurance: number;
    family: number;
    sipDeductions: number;
    other: number;
    total: number;
  };
  netChange: number;
  netWorth: number;
  previousNetWorth: number;
  events: GameEvent[];
  news: NewsItem[];
  stockPerformance: number;
}

// --- Toast Notifications ---

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'achievement' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

// --- Game Meta ---

export interface GameMeta {
  gameStarted: boolean;
  playerName: string;
  difficulty: 'easy' | 'normal' | 'hard';
  currentMonth: number;
  totalMonths: number;
  lastPlayedTimestamp: number;
  gameSpeed: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
  // Timeline Upgrade
  currentDay: number;
  isPaused: boolean;
  speedBoostRemainingDays: number;
  infiniteModeActive: boolean;
}

// --- Complete Game State ---

export interface GameState {
  meta: GameMeta;
  player: {
    name: string;
    age: number;
    cash: number;
    netWorth: number;
    netWorthHistory: number[];
    monthlyIncome: number;
    monthlyExpenses: number;
    currentJob: PlayerJob | null;
    completedEducation: string[];
    activeEducation: ActiveEducation | null;
    skills: Record<SkillType, number>;
    stats: LifeStats;
    experience: number;
    creditScore: number;
    creditCards: CreditCard[];
    wealthTokens: number;
    dailyLoginStreak: number;
    lastLoginDate: string;
    activeLifestyle: string[];
    // Phase 2
    ownedStatusItems: string[];
    flexScore: number;
    totalDonated: number;
    socialMediaFollowers: number;
  };
  market: {
    companies: Company[];
    cryptoAssets: CryptoAsset[];
    holdings: StockHolding[];
    cryptoHoldings: CryptoHolding[];
    marketTrend: 'bull' | 'bear' | 'neutral';
    volatilityIndex: number;
    // Phase 2
    mutualFunds: MutualFund[];
    mutualFundHoldings: MutualFundHolding[];
    sips: SIPInvestment[];
    commodities: Commodity[];
    commodityHoldings: CommodityHolding[];
    forexPairs: ForexPairData[];
    forexPositions: ForexPosition[];
    marketOrders: MarketOrder[];
  };
  businesses: OwnedBusiness[];
  properties: OwnedProperty[];
  loans: Loan[];
  eventHistory: GameEvent[];
  pendingEvent: GameEvent | null;
  achievements: Achievement[];
  monthSummaries: MonthlySummary[];
  toasts: ToastNotification[];
  // Phase 2
  startup: OwnedStartup | null;
  sideHustles: ActiveSideHustle[];
  family: FamilyState;
  insurance: ActiveInsurance[];
  taxPlanning: TaxPlanningState;
  goals: FinancialGoal[];
  challenges: Challenge[];
  newsFeed: NewsItem[];
  donations: DonationRecord[];
  ui: {
    currentScreen: ScreenType;
    activeSubTab: string;
    showMonthSummary: boolean;
    showNewGameModal: boolean;
    showEventModal: boolean;
    isAdvancingMonth: boolean;
  };
}
