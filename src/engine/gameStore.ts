// ============================================================
// NETWORTH — Main Game Store (Zustand) — Phase 2
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GameState,
  SkillType,
  StockHolding,
  CryptoHolding,
  OwnedBusiness,
  OwnedProperty,
  Loan,
  ToastNotification,
  MonthlySummary,
  GameEvent,
  ActiveEducation,
  PlayerJob,
  ScreenType,
  SIPInvestment,
  MutualFundHolding,
  CommodityHolding,
  ForexPosition,
  ForexPair,
  ActiveSideHustle,
  ActiveInsurance,
  FinancialGoal,
  Challenge,
  NewsItem,
  DonationRecord,
  MarketOrder,
} from './types';
import {
  initializeMarket,
  updateStockPrices,
  updateCryptoPrices,
  calculateDividends,
  calculatePortfolioValue,
  determineMarketTrend,
  updateMarketDaily,
} from './marketEngine';
import { generateMonthlyEvents, applyEventEffects } from './eventSystem';
import { JOBS, EDUCATION_COURSES, BUSINESS_TEMPLATES, PROPERTY_TEMPLATES, ACHIEVEMENTS, LIFESTYLE_CHOICES } from './gameData';
import { generateId, clamp, calculateEMI, calculateTax, randomChance, randomBetween } from '../lib/utils';
import { MUTUAL_FUNDS, updateMutualFundNAVs } from './mutualFundData';
import { COMMODITIES, updateCommodityPrices } from './commodityData';
import { FOREX_PAIRS, updateForexRates, calculateForexPnL } from './forexData';
import { STARTUP_TEMPLATES, createStartup, tickStartup, raiseFunding, tryAdvanceStage } from './startupSystem';
import { createInitialTaxState, tickPPF, tickNPS, calculateLTCG, calculateSTCG, calculateOptimalTax, SECTION_80C_LIMIT } from './taxPlanningSystem';
import { createInitialFamilyState, tickFamily, calculateFamilyExpenses, startDating, getMarried, haveKid, getDivorce } from './familySystem';
import { updateGoalProgress } from './goalsSystem';
import { generateMonthlyNews } from './newsSystem';
import { generateChallenges, updateChallengeProgress } from './challengeSystem';
import { calculateSeasonalMultipliers } from './seasonSystem';
import { STATUS_ITEMS, calculateStatusMonthlyCost, calculateFlexScore } from './socialStatusData';
import { SIDE_HUSTLES } from './sideHustleData';
import { NETWORKING_EVENTS } from './networkingData';
import { INSURANCE_POLICIES, calculateAssetPremium } from './insuranceSystem';

// ----- INITIAL STATE -----

function createInitialState(): GameState {
  const { companies, cryptoAssets } = initializeMarket();

  return {
    meta: {
      gameStarted: false,
      playerName: '',
      difficulty: 'normal',
      currentMonth: 0,
      totalMonths: 360,
      lastPlayedTimestamp: Date.now(),
      gameSpeed: 1,
      soundEnabled: true,
      reducedMotion: false,
      currentDay: 1,
      isPaused: true,
      speedBoostRemainingDays: 0,
      infiniteModeActive: false,
    },
    player: {
      name: '',
      age: 22,
      cash: 5000,
      netWorth: 5000,
      netWorthHistory: [5000],
      monthlyIncome: 0,
      monthlyExpenses: 0,
      currentJob: null,
      completedEducation: [],
      activeEducation: null,
      skills: {
        technical: 0,
        business: 0,
        communication: 1,
        leadership: 0,
        finance: 0,
        marketing: 0,
        analytics: 0,
      },
      experience: 0,
      stats: {
        happiness: 50,
        health: 80,
        energy: 60,
        motivation: 70,
        reputation: 10,
      },
      creditScore: 500,
      creditCards: [],
      wealthTokens: 0,
      dailyLoginStreak: 0,
      lastLoginDate: '',
      activeLifestyle: [],
      // Phase 2
      ownedStatusItems: [],
      flexScore: 0,
      totalDonated: 0,
      socialMediaFollowers: 0,
    },
    market: {
      companies,
      cryptoAssets,
      holdings: [],
      cryptoHoldings: [],
      marketTrend: 'neutral',
      volatilityIndex: 30,
      // Phase 2
      mutualFunds: [...MUTUAL_FUNDS],
      mutualFundHoldings: [],
      sips: [],
      commodities: [...COMMODITIES],
      commodityHoldings: [],
      forexPairs: [...FOREX_PAIRS],
      forexPositions: [],
      marketOrders: [],
    },
    businesses: [],
    properties: [],
    loans: [],
    eventHistory: [],
    pendingEvent: null,
    achievements: [...ACHIEVEMENTS],
    monthSummaries: [],
    toasts: [],
    // Phase 2
    startup: null,
    sideHustles: [],
    family: createInitialFamilyState(),
    insurance: [],
    taxPlanning: createInitialTaxState(),
    goals: [],
    challenges: [],
    newsFeed: [],
    donations: [],
    ui: {
      currentScreen: 'dashboard',
      activeSubTab: '',
      showMonthSummary: false,
      showNewGameModal: true,
      showEventModal: false,
      isAdvancingMonth: false,
    },
  };
}

// ----- STORE ACTIONS -----

interface GameActions {
  // Game lifecycle
  startNewGame: (name: string, difficulty: 'easy' | 'normal' | 'hard') => void;
  resetGame: () => void;

  // Core game loop
  advanceMonth: () => void;

  // Job actions
  applyForJob: (jobId: string) => boolean;
  quitJob: () => void;

  // Education actions
  enrollEducation: (educationId: string) => boolean;
  dropEducation: () => void;

  // Stock actions
  buyStock: (companyId: string, shares: number) => boolean;
  sellStock: (companyId: string, shares: number) => boolean;
  buyCrypto: (cryptoId: string, amount: number) => boolean;
  sellCrypto: (cryptoId: string, units: number) => boolean;

  // Business actions
  startBusiness: (templateId: string) => boolean;
  upgradeBusiness: (businessId: string, upgradeId: string) => boolean;
  sellBusiness: (businessId: string) => void;

  // Property actions
  changeHousing: (propertyId: string) => void;
  buyProperty: (templateId: string) => boolean;
  sellProperty: (propertyId: string) => void;

  // Loan actions
  takeLoan: (type: string, amount: number, months: number) => boolean;
  payOffLoan: (loanId: string) => boolean;

  // Lifestyle
  toggleLifestyle: (choiceId: string) => void;

  // Event handling
  handleEventChoice: (choiceIndex: number) => void;
  dismissEvent: () => void;

  // UI actions
  setScreen: (screen: ScreenType) => void;
  setSubTab: (tab: string) => void;
  dismissMonthSummary: () => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleSound: () => void;
  toggleReducedMotion: () => void;

  // --- Phase 2 Actions ---

  // Mutual Funds
  buyMutualFund: (fundId: string, amount: number) => boolean;
  sellMutualFund: (holdingIndex: number) => boolean;
  startSIP: (fundId: string, monthlyAmount: number) => boolean;
  stopSIP: (sipId: string) => void;

  // Commodities
  buyCommodity: (commodityId: string, quantity: number) => boolean;
  sellCommodity: (holdingIndex: number) => boolean;

  // Insurance
  buyInsurance: (policyId: string) => boolean;
  cancelInsurance: (policyId: string) => void;

  // Side Hustles
  startSideHustle: (hustleId: string) => boolean;
  stopSideHustle: (hustleId: string) => void;

  // Status Items
  buyStatusItem: (itemId: string) => boolean;

  // Goals
  addGoal: (goal: FinancialGoal) => void;
  removeGoal: (goalId: string) => void;

  // Donations
  makeDonation: (cause: string, amount: number) => boolean;

  // Networking
  attendNetworkingEvent: (eventId: string) => boolean;

  // Family
  startDating: () => void;
  getMarried: (weddingTier: 'simple' | 'standard' | 'grand' | 'royal', hasPrenup: boolean) => boolean;
  haveKid: () => boolean;
  divorce: () => void;

  // Startup
  foundStartup: (templateId: string) => boolean;
  raiseStartupFunding: () => boolean;
  hireEmployee: () => boolean;
  fireEmployee: () => boolean;
  improveProduct: () => boolean;
  shutDownStartup: () => void;

  // Tax planning
  contributePPF: (amount: number) => boolean;
  contributeNPS: (amount: number) => boolean;
  setPPFMonthlyContribution: (amount: number) => void;
  setNPSMonthlyContribution: (amount: number) => void;

  // Forex
  openForexPosition: (pairId: ForexPair, type: 'long' | 'short', lotSize: number, leverage: number, stopLoss?: number, takeProfit?: number) => boolean;
  closeForexPosition: (positionId: string) => boolean;

  // Timeline Upgrade Actions
  togglePause: () => void;
  setGameSpeed: (speed: number) => void;
  tickDaily: () => void;
  skipTime: (months: number) => boolean;
  buySpeedBoost: (boostType: '3x_1mo' | '5x_3mo') => boolean;
  keepPlayingInfinite: () => void;
}

// Type for the combined store
type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      // ========================
      // GAME LIFECYCLE
      // ========================

      startNewGame: (name, difficulty) => {
        const state = createInitialState();
        const difficultyMods = {
          easy: { cash: 25000, creditScore: 600, happiness: 65 },
          normal: { cash: 5000, creditScore: 500, happiness: 50 },
          hard: { cash: 2000, creditScore: 400, happiness: 40 },
        };
        const mods = difficultyMods[difficulty];

        set({
          ...state,
          meta: {
            ...state.meta,
            gameStarted: true,
            playerName: name,
            difficulty,
            currentMonth: 1,
            lastPlayedTimestamp: Date.now(),
          },
          player: {
            ...state.player,
            name,
            cash: mods.cash,
            netWorth: mods.cash,
            netWorthHistory: [mods.cash],
            creditScore: mods.creditScore,
            stats: { ...state.player.stats, happiness: mods.happiness },
          },
          // Player starts renting the tiny room
          properties: [
            {
              id: generateId(),
              templateId: 'tiny_room',
              purchasePrice: 0,
              currentValue: 0,
              monthsOwned: 0,
              isPlayerHome: true,
              monthlyRentIncome: 0,
            },
          ],
          ui: {
            ...state.ui,
            showNewGameModal: false,
          },
        });
      },

      resetGame: () => {
        set(createInitialState());
      },

      // ========================
      // CORE GAME LOOP
      // ========================

      advanceMonth: () => {
        const state = get();
        if (state.ui.isAdvancingMonth) return;
        if (!state.meta.infiniteModeActive && state.meta.totalMonths > 0 && state.meta.currentMonth >= state.meta.totalMonths) {
          set((s) => ({ meta: { ...s.meta, isPaused: true } }));
          return;
        }

        set({ ui: { ...state.ui, isAdvancingMonth: true } });

        const newToasts: ToastNotification[] = [];

        // --- 1. CALCULATE SEASONAL & EVENT EFFECTS ---
        const seasonalMods = calculateSeasonalMultipliers(state.meta.currentMonth + 1);
        const events = generateMonthlyEvents(state);

        interface TickEffects {
          cashChange: number;
          statsChanges: Record<string, number>;
          stockMultiplier: number;
          sectorMultipliers: Record<string, number>;
          businessRevenueMultiplier: number;
          salaryMultiplier: number;
        }

        const eventEffects: TickEffects = {
          cashChange: 0,
          statsChanges: {},
          stockMultiplier: 1,
          sectorMultipliers: {},
          businessRevenueMultiplier: 1,
          salaryMultiplier: 1,
        };

        for (const event of events) {
          const effects = applyEventEffects(event.effects, state);
          eventEffects.cashChange += effects.cashChange || 0;
          eventEffects.stockMultiplier *= effects.stockMultiplier || 1;
          eventEffects.businessRevenueMultiplier *= effects.businessRevenueMultiplier || 1;
          eventEffects.salaryMultiplier *= effects.salaryMultiplier || 1;
          Object.assign(eventEffects.statsChanges, effects.statsChanges || {});
          Object.assign(eventEffects.sectorMultipliers, effects.sectorMultipliers || {});
        }

        // Combine stock market multipliers
        const finalStockMultiplier = eventEffects.stockMultiplier * seasonalMods.stockMarket;

        // --- 2. INCOME PHASE ---
        let salaryIncome = 0;
        let salaryBonusCash = 0;

        // Salary
        if (state.player.currentJob) {
          const job = JOBS.find((j) => j.id === state.player.currentJob!.jobId);
          if (job) {
            const performanceBonus = 1 + (state.player.currentJob.performance - 50) * 0.002;
            salaryIncome = Math.round(job.salary * performanceBonus * eventEffects.salaryMultiplier);
            if (seasonalMods.salaryBonus > 0) {
              salaryBonusCash = Math.round(salaryIncome * seasonalMods.salaryBonus);
            }
          }
        }

        // Partner income
        let partnerIncome = 0;
        if (state.family.relationshipStatus === 'married' && state.family.partnerIncome > 0) {
          partnerIncome = state.family.partnerIncome;
        }

        // Business income
        let businessIncome = 0;
        for (const biz of state.businesses) {
          const profit = biz.monthlyRevenue - biz.monthlyExpenses;
          businessIncome += Math.round(profit * eventEffects.businessRevenueMultiplier * seasonalMods.businessRevenue);
        }

        // Dividends
        const dividendIncome = calculateDividends(state);

        // Rental income
        let rentalIncome = 0;
        for (const prop of state.properties) {
          if (!prop.isPlayerHome && prop.monthlyRentIncome > 0) {
            rentalIncome += prop.monthlyRentIncome;
          }
        }

        // Side Hustle income
        let sideHustleIncome = 0;
        let totalSideHustleEnergyCost = 0;
        const updatedSideHustles = state.sideHustles.map((sh) => {
          const template = SIDE_HUSTLES.find((t) => t.id === sh.hustleId);
          if (template) {
            const fluctuation = randomBetween(1 - template.variability, 1 + template.variability);
            const monthlyPay = Math.round(sh.currentIncome * fluctuation);
            sideHustleIncome += monthlyPay;
            totalSideHustleEnergyCost += template.energyCost;

            return {
              ...sh,
              monthsActive: sh.monthsActive + 1,
              currentIncome: Math.round(sh.currentIncome * (1 + template.growthRate)),
              totalEarned: sh.totalEarned + monthlyPay,
            };
          }
          return sh;
        });

        // Commodity Payouts (SGB interest)
        let sgbInterestIncome = 0;
        for (const holding of state.market.commodityHoldings) {
          const comm = state.market.commodities.find((c) => c.id === holding.commodityId);
          if (comm && comm.type === 'sgb' && comm.interestRate > 0) {
            sgbInterestIncome += Math.round((comm.interestRate / 12) * holding.totalInvested);
          }
        }

        // Add up baseline monthly cash inflows
        const monthlyBaseIncome = salaryIncome + salaryBonusCash + Math.max(0, businessIncome) + dividendIncome + rentalIncome + sideHustleIncome + partnerIncome + sgbInterestIncome;

        // --- 3. EXPENSES PHASE ---
        let housingExpense = 0;
        let loanEMIs = 0;
        let educationExpense = 0;
        let lifestyleExpense = 0;

        // Housing
        const currentHome = state.properties.find((p) => p.isPlayerHome);
        if (currentHome) {
          const template = PROPERTY_TEMPLATES.find((t) => t.id === currentHome.templateId);
          if (template && template.type === 'rental') {
            housingExpense = template.monthlyRent;
          }
        }

        // Loans
        for (const loan of state.loans) {
          loanEMIs += loan.monthlyEMI;
        }

        // Education
        if (state.player.activeEducation && !state.player.activeEducation.isCompleted) {
          const edu = EDUCATION_COURSES.find((e) => e.id === state.player.activeEducation!.educationId);
          if (edu) {
            educationExpense = edu.costPerMonth;
          }
        }

        // Lifestyle (seasonal spending multiplier applied)
        for (const choiceId of state.player.activeLifestyle) {
          const choice = LIFESTYLE_CHOICES.find((c) => c.id === choiceId);
          if (choice) {
            lifestyleExpense += choice.monthlyCost;
          }
        }
        lifestyleExpense = Math.round(lifestyleExpense * seasonalMods.expenses);

        // Status Item Maintenance
        const statusMaintenanceCost = calculateStatusMonthlyCost(state.player.ownedStatusItems);

        // Family Expense
        const familyExpense = calculateFamilyExpenses(state.family);

        // Insurance Premiums
        let insurancePremiums = 0;
        const updatedInsurance = state.insurance.map((ins) => {
          const policy = INSURANCE_POLICIES.find((p) => p.id === ins.policyId);
          let monthlyCost = 0;
          if (policy) {
            if (policy.type === 'property') {
              const prop = state.properties.find((p) => !p.isPlayerHome) || state.properties[0];
              const val = prop ? prop.currentValue : 5000000;
              monthlyCost = calculateAssetPremium(val, 0.005);
            } else if (policy.type === 'vehicle') {
              const car = state.player.ownedStatusItems.find((i) => {
                const item = STATUS_ITEMS.find((s) => s.id === i);
                return item && item.category === 'vehicle';
              });
              const itemData = STATUS_ITEMS.find((s) => s.id === car);
              const val = itemData ? itemData.cost : 1000000;
              monthlyCost = calculateAssetPremium(val, 0.02);
            } else {
              monthlyCost = policy.monthlyPremium;
            }
          }
          insurancePremiums += monthlyCost;
          return {
            ...ins,
            totalPremiumPaid: ins.totalPremiumPaid + monthlyCost,
          };
        });

        // Taxes
        // Get active health policy for 80D
        const activeHealthInsurance = state.insurance.find((ins) => {
          const policy = INSURANCE_POLICIES.find((p) => p.id === ins.policyId);
          return policy && policy.type === 'health';
        });
        let section80D = 0;
        if (activeHealthInsurance) {
          const policy = INSURANCE_POLICIES.find((p) => p.id === activeHealthInsurance.policyId);
          if (policy) {
            section80D = policy.monthlyPremium * 12;
          }
        }

        // Get HRA
        let hra = 0;
        if (currentHome) {
          const template = PROPERTY_TEMPLATES.find((t) => t.id === currentHome.templateId);
          if (template && template.type === 'rental') {
            hra = Math.round(template.monthlyRent * 12 * 0.40);
          }
        }

        // Get 80G donations
        const donations80G = state.donations
          .filter((d) => state.meta.currentMonth - d.month <= 12)
          .reduce((sum, d) => sum + d.amount, 0);

        const annualIncome = monthlyBaseIncome * 12;
        const taxOpt = calculateOptimalTax(annualIncome, {
          section80C: state.taxPlanning.section80CUsed,
          section80D,
          nps: state.taxPlanning.npsMonthlyContribution * 12,
          hra,
          donations80G,
        });

        const annualTax = taxOpt.recommendOld ? taxOpt.oldRegimeTax : taxOpt.newRegimeTax;
        const monthlyTax = Math.round(annualTax / 12);
        const taxSaved = Math.max(0, taxOpt.newRegimeTax - taxOpt.oldRegimeTax);

        // Add up baseline monthly cash outflows
        const monthlyBaseExpenses = housingExpense + loanEMIs + educationExpense + lifestyleExpense + monthlyTax + statusMaintenanceCost + familyExpense + insurancePremiums;

        // Start tracking cash change
        let newCash = state.player.cash + monthlyBaseIncome - monthlyBaseExpenses + eventEffects.cashChange;

        // --- 4. INVESTMENTS DEDUCTIONS PHASE (SIP, PPF, NPS) ---
        let sipDeductions = 0;
        let updatedMFHoldings = [...state.market.mutualFundHoldings];
        const updatedSIPs = state.market.sips.map((sip) => {
          if (!sip.isActive) return sip;

          const fund = state.market.mutualFunds.find((f) => f.id === sip.fundId);
          if (!fund) return sip;

          if (newCash >= sip.monthlyAmount) {
            newCash -= sip.monthlyAmount;
            sipDeductions += sip.monthlyAmount;
            const units = +(sip.monthlyAmount / fund.nav).toFixed(4);

            const existingIndex = updatedMFHoldings.findIndex((h) => h.fundId === sip.fundId);
            if (existingIndex >= 0) {
              const existing = updatedMFHoldings[existingIndex];
              const newTotalInvested = existing.totalInvested + sip.monthlyAmount;
              const newUnits = existing.units + units;
              updatedMFHoldings[existingIndex] = {
                ...existing,
                units: newUnits,
                totalInvested: newTotalInvested,
                avgNav: +(newTotalInvested / newUnits).toFixed(4),
              };
            } else {
              updatedMFHoldings.push({
                fundId: sip.fundId,
                units,
                avgNav: fund.nav,
                totalInvested: sip.monthlyAmount,
                purchaseMonth: state.meta.currentMonth,
              });
            }

            return {
              ...sip,
              totalInvested: sip.totalInvested + sip.monthlyAmount,
              unitsAccumulated: +(sip.unitsAccumulated + units).toFixed(4),
            };
          } else {
            return { ...sip, isActive: false };
          }
        });

        // Check for newly paused SIPs
        const deactivatedSIPs = updatedSIPs.filter((s, idx) => s.isActive !== state.market.sips[idx].isActive && !s.isActive);
        for (const s of deactivatedSIPs) {
          const fund = state.market.mutualFunds.find((f) => f.id === s.fundId);
          newToasts.push({
            id: generateId(),
            type: 'warning',
            title: 'SIP Paused',
            message: `Insufficient cash to process auto-SIP of ₹${s.monthlyAmount.toLocaleString()} for ${fund?.name || s.fundId}.`,
          });
        }

        // PPF and NPS deductions
        let ppfNpsDeductions = 0;
        let updatedTaxPlanning = { ...state.taxPlanning };

        if (updatedTaxPlanning.ppfMonthlyContribution > 0) {
          const cost = updatedTaxPlanning.ppfMonthlyContribution;
          if (newCash >= cost) {
            newCash -= cost;
            ppfNpsDeductions += cost;
            updatedTaxPlanning.ppfBalance += cost;
            updatedTaxPlanning.section80CUsed = Math.min(SECTION_80C_LIMIT, updatedTaxPlanning.section80CUsed + cost);
          } else {
            updatedTaxPlanning.ppfMonthlyContribution = 0;
            newToasts.push({
              id: generateId(),
              type: 'warning',
              title: 'PPF Payment Paused',
              message: `Insufficient cash for PPF monthly contribution of ₹${cost.toLocaleString()}.`,
            });
          }
        }

        if (updatedTaxPlanning.npsMonthlyContribution > 0) {
          const cost = updatedTaxPlanning.npsMonthlyContribution;
          if (newCash >= cost) {
            newCash -= cost;
            ppfNpsDeductions += cost;
            updatedTaxPlanning.npsBalance += cost;
          } else {
            updatedTaxPlanning.npsMonthlyContribution = 0;
            newToasts.push({
              id: generateId(),
              type: 'warning',
              title: 'NPS Payment Paused',
              message: `Insufficient cash for NPS monthly contribution of ₹${cost.toLocaleString()}.`,
            });
          }
        }

        // Run interest/return ticks for PPF and NPS
        updatedTaxPlanning = tickPPF(updatedTaxPlanning);
        updatedTaxPlanning = tickNPS(updatedTaxPlanning);
        updatedTaxPlanning.totalTaxSaved += Math.round(taxSaved / 12);
        updatedTaxPlanning.lastTaxFiled = annualTax;

        // --- 5. STARTUP OPERATIONS TICK ---
        let startupBurnPaidByPlayer = 0;
        let updatedStartup = state.startup ? tickStartup(state.startup) : null;
        if (updatedStartup) {
          const oldStage = updatedStartup.stage;
          updatedStartup = tryAdvanceStage(updatedStartup);
          if (updatedStartup.stage !== oldStage) {
            newToasts.push({
              id: generateId(),
              type: 'success',
              title: 'Startup Progressed! 🚀',
              message: `${updatedStartup.name} is now in the ${updatedStartup.stage.toUpperCase()} stage!`,
            });
          }
        }
        let startupExitCash = 0;

        if (updatedStartup) {
          if (updatedStartup.stage === 'failed') {
            newToasts.push({
              id: generateId(),
              type: 'error',
              title: 'Startup Bankrupt 😭',
              message: `${updatedStartup.name} has run out of funds and shut down. All equity is lost.`,
            });
            updatedStartup = null;
          } else if (updatedStartup.stage === 'ipo' || updatedStartup.stage === 'acquired') {
            startupExitCash = Math.round(updatedStartup.valuation * (updatedStartup.equity / 100));
            newCash += startupExitCash;
            newToasts.push({
              id: generateId(),
              type: 'success',
              title: updatedStartup.stage === 'ipo' ? 'IPO Success! 🚀' : 'Startup Acquired! 🏢',
              message: `Your startup ${updatedStartup.name} exited! Payout: ₹${startupExitCash.toLocaleString()} for your ${updatedStartup.equity}% equity.`,
            });
            updatedStartup = null;
          } else {
            const netBurn = updatedStartup.monthlyBurn - updatedStartup.revenue;
            if (netBurn > 0) {
              if (updatedStartup.fundingRaised >= netBurn) {
                updatedStartup.fundingRaised -= netBurn;
              } else {
                const remainder = netBurn - updatedStartup.fundingRaised;
                updatedStartup.fundingRaised = 0;
                if (newCash >= remainder) {
                  newCash -= remainder;
                  startupBurnPaidByPlayer = remainder;
                } else {
                  newToasts.push({
                    id: generateId(),
                    type: 'error',
                    title: 'Startup Runway Empty',
                    message: `You cannot afford the monthly burn of ₹${remainder.toLocaleString()} for ${updatedStartup.name}. Startup was forced to shut down.`,
                  });
                  updatedStartup = null;
                }
              }
            } else {
              updatedStartup.fundingRaised += Math.abs(netBurn);
            }
          }
        }

        // Clamp cash to 0 (losses or expenses could put it negative)
        newCash = Math.max(0, newCash);

        // --- 6. UPDATE MARKETS ---
        const newCompanies = updateStockPrices(
          state.market.companies,
          finalStockMultiplier,
          eventEffects.sectorMultipliers,
          state.market.marketTrend
        );
        const newCrypto = updateCryptoPrices(
          state.market.cryptoAssets,
          finalStockMultiplier,
          eventEffects.sectorMultipliers
        );
        const newMarketTrend = determineMarketTrend(newCompanies);

        const updatedMutualFunds = updateMutualFundNAVs(state.market.mutualFunds, finalStockMultiplier);
        const updatedCommodities = updateCommodityPrices(state.market.commodities, finalStockMultiplier);
        const updatedForexPairs = updateForexRates(state.market.forexPairs, state.market.volatilityIndex);

        // --- 7. FOREX OPEN POSITIONS TICK (SL/TP & Liquidations) ---
        let forexCashAdjustments = 0;
        const remainingPositions: ForexPosition[] = [];

        for (const pos of state.market.forexPositions) {
          const pair = updatedForexPairs.find((p) => p.id === pos.pairId);
          if (!pair) {
            remainingPositions.push(pos);
            continue;
          }

          const currentRate = pair.currentRate;
          const profitLoss = calculateForexPnL({
            type: pos.type,
            entryRate: pos.entryRate,
            currentRate,
            lotSize: pos.lotSize,
            leverage: pos.leverage,
          });

          let triggerClose = false;
          let closeReason = '';
          let finalProceeds = pos.margin + profitLoss;

          // Margin liquidation check
          if (profitLoss <= -pos.margin) {
            triggerClose = true;
            closeReason = 'Margin Liquidation 🚨';
            finalProceeds = 0;
          } else if (pos.stopLoss && (
            (pos.type === 'long' && currentRate <= pos.stopLoss) ||
            (pos.type === 'short' && currentRate >= pos.stopLoss)
          )) {
            triggerClose = true;
            closeReason = 'Stop Loss Hit 🛑';
          } else if (pos.takeProfit && (
            (pos.type === 'long' && currentRate >= pos.takeProfit) ||
            (pos.type === 'short' && currentRate <= pos.takeProfit)
          )) {
            triggerClose = true;
            closeReason = 'Take Profit Hit 🎯';
          }

          if (triggerClose) {
            forexCashAdjustments += finalProceeds;
            newToasts.push({
              id: generateId(),
              type: profitLoss >= 0 ? 'success' : 'error',
              title: closeReason,
              message: `Forex position ${pos.type.toUpperCase()} ${pos.pairId} closed automatically. P&L: ₹${profitLoss.toLocaleString()}`,
            });
          } else {
            remainingPositions.push({
              ...pos,
              currentRate,
              profitLoss,
            });
          }
        }
        newCash += forexCashAdjustments;

        // --- 8. UPDATE BUSINESSES ---
        const updatedBusinesses = state.businesses.map((biz) => {
          const profit = biz.monthlyRevenue - biz.monthlyExpenses;
          const newConsecutiveLoss = profit < 0 ? biz.consecutiveLossMonths + 1 : 0;
          const healthChange = profit > 0 ? 3 : profit < 0 ? -10 : -2;

          // Random revenue fluctuation (±10%)
          const revenueFluctuation = randomBetween(0.9, 1.1);

          return {
            ...biz,
            monthsOwned: biz.monthsOwned + 1,
            totalProfit: biz.totalProfit + profit,
            consecutiveLossMonths: newConsecutiveLoss,
            health: clamp(biz.health + healthChange, 0, 100),
            monthlyRevenue: Math.round(biz.monthlyRevenue * revenueFluctuation),
          };
        }).filter((biz) => {
          if (biz.consecutiveLossMonths >= 3 && biz.health < 20) {
            if (randomChance(0.5)) {
              return false; // Remove business
            }
          }
          return true;
        });

        // --- 9. UPDATE PROPERTIES ---
        const updatedProperties = state.properties.map((prop) => {
          const template = PROPERTY_TEMPLATES.find((t) => t.id === prop.templateId);
          if (template && template.type !== 'rental') {
            const monthlyAppreciation = template.appreciation / 12;
            return {
              ...prop,
              monthsOwned: prop.monthsOwned + 1,
              currentValue: Math.round(prop.currentValue * (1 + monthlyAppreciation)),
            };
          }
          return { ...prop, monthsOwned: prop.monthsOwned + 1 };
        });

        // --- 10. UPDATE COMMODITIES SGB MATURITY ---
        let maturedGoldWindfall = 0;
        const updatedCommodityHoldings = state.market.commodityHoldings.filter((holding) => {
          const comm = updatedCommodities.find((c) => c.id === holding.commodityId);
          if (comm && comm.type === 'sgb' && comm.maturityMonths > 0) {
            const monthsPassed = state.meta.currentMonth + 1 - holding.purchaseMonth;
            if (monthsPassed >= comm.maturityMonths) {
              const value = Math.round(holding.quantity * comm.pricePerUnit);
              maturedGoldWindfall += value;
              newToasts.push({
                id: generateId(),
                type: 'success',
                title: 'Sovereign Gold Bond Matured! 🪙',
                message: `Your SGB purchased in month ${holding.purchaseMonth} has matured. ₹${value.toLocaleString()} has been credited to your cash tax-free.`,
              });
              return false; // Remove SGB holding
            }
          }
          return true;
        });
        newCash += maturedGoldWindfall;

        // --- 11. UPDATE LOANS ---
        const updatedLoans = state.loans
          .map((loan) => ({
            ...loan,
            monthsPaid: loan.monthsPaid + 1,
            remainingAmount: Math.max(0, loan.remainingAmount - (loan.monthlyEMI - (loan.remainingAmount * loan.interestRate / 12))),
          }))
          .filter((loan) => loan.remainingAmount > 0 && loan.monthsPaid < loan.totalMonths);

        // --- 12. UPDATE EDUCATION ---
        let newActiveEducation = state.player.activeEducation;
        let newCompletedEducation = [...state.player.completedEducation];
        let newSkills = { ...state.player.skills };

        if (newActiveEducation && !newActiveEducation.isCompleted) {
          newActiveEducation = {
            ...newActiveEducation,
            monthsCompleted: newActiveEducation.monthsCompleted + 1,
          };
          if (newActiveEducation.monthsCompleted >= newActiveEducation.totalMonths) {
            newActiveEducation = { ...newActiveEducation, isCompleted: true };
            newCompletedEducation.push(newActiveEducation.educationId);

            const edu = EDUCATION_COURSES.find((e) => e.id === newActiveEducation!.educationId);
            if (edu) {
              for (const [skill, boost] of Object.entries(edu.skillBoosts)) {
                newSkills[skill as SkillType] = (newSkills[skill as SkillType] || 0) + (boost || 0);
              }
            }

            newActiveEducation = null;
          }
        }

        // --- 13. UPDATE LIFE STATS ---
        const statsChanges = (eventEffects.statsChanges || {}) as Record<string, number>;
        let newStats = { ...state.player.stats };

        // Job stress impact
        if (state.player.currentJob) {
          const job = JOBS.find((j) => j.id === state.player.currentJob!.jobId);
          if (job) {
            newStats.energy = newStats.energy - (job.stressLevel * 0.1);
            newStats.happiness = newStats.happiness - (job.stressLevel * 0.05) + 2;
          }
        } else {
          newStats.happiness -= 3;
          newStats.motivation -= 2;
        }

        // Side Hustle energy drain
        newStats.energy -= totalSideHustleEnergyCost;

        // Lifestyle effects
        for (const choiceId of state.player.activeLifestyle) {
          const choice = LIFESTYLE_CHOICES.find((c) => c.id === choiceId);
          if (choice) {
            for (const [stat, value] of Object.entries(choice.effects)) {
              newStats[stat as keyof typeof newStats] += value;
            }
          }
        }

        // Event effects
        for (const [stat, value] of Object.entries(statsChanges)) {
          if (stat in newStats) {
            newStats[stat as keyof typeof newStats] += value as number;
          }
        }

        // Natural recovery
        newStats.energy = newStats.energy + 5;
        newStats.health = newStats.health - 0.2;

        newStats = {
          happiness: clamp(newStats.happiness, 0, 100),
          health: clamp(newStats.health, 0, 100),
          energy: clamp(newStats.energy, 0, 100),
          motivation: clamp(newStats.motivation, 0, 100),
          reputation: clamp(newStats.reputation, 0, 100),
        };

        // --- 14. UPDATE JOB ---
        let newJob = state.player.currentJob;
        let newExperience = state.player.experience;
        if (newJob) {
          newJob = {
            ...newJob,
            monthsWorked: newJob.monthsWorked + 1,
            performance: clamp(
              newJob.performance + randomBetween(-3, 5) + (newStats.motivation - 50) * 0.05,
              20,
              100
            ),
          };
          newExperience += 1;

          // Promotion check every 6 months
          const job = JOBS.find((j) => j.id === newJob!.jobId);
          if (job && job.nextJobId && newJob.monthsWorked - newJob.lastPromotionCheck >= 6) {
            const promoChance = job.promotionChance * (newJob.performance / 70);
            if (randomChance(promoChance)) {
              newJob = {
                jobId: job.nextJobId,
                monthsWorked: 0,
                performance: 60,
                lastPromotionCheck: 0,
              };
            } else {
              newJob = { ...newJob, lastPromotionCheck: newJob.monthsWorked };
            }
          }
        }

        // --- 15. UPDATE FAMILY ---
        const updatedFamily = tickFamily(state.family);

        // --- 16. CREDIT SCORE UPDATE ---
        let newCreditScore = state.player.creditScore;
        if (state.loans.length > 0) {
          newCreditScore += 2;
        }
        if (monthlyBaseIncome > 0) {
          newCreditScore += 1;
        }
        const totalDebt = state.loans.reduce((sum, l) => sum + l.remainingAmount, 0);
        if (monthlyBaseIncome > 0 && totalDebt / (monthlyBaseIncome * 12) > 0.4) {
          newCreditScore -= 3;
        }
        newCreditScore = clamp(newCreditScore, 300, 900);

        // --- 17. CALCULATE NET WORTH ---
        const portfolioValue = calculatePortfolioValue({
          ...state,
          market: {
            ...state.market,
            companies: newCompanies,
            cryptoAssets: newCrypto,
            mutualFunds: updatedMutualFunds,
            mutualFundHoldings: updatedMFHoldings,
            commodities: updatedCommodities,
            commodityHoldings: updatedCommodityHoldings,
            forexPairs: updatedForexPairs,
            forexPositions: remainingPositions,
          },
        });

        const propertyValue = updatedProperties
          .filter((p) => p.currentValue > 0)
          .reduce((sum, p) => sum + p.currentValue, 0);

        const businessEquity = updatedBusinesses.reduce((sum, b) => {
          const template = BUSINESS_TEMPLATES.find((t) => t.id === b.templateId);
          const annualProfit = (b.monthlyRevenue - b.monthlyExpenses) * 12;
          return sum + Math.max(template?.startupCost || 0, annualProfit * 5);
        }, 0);

        const startupValue = updatedStartup ? Math.round(updatedStartup.valuation * (updatedStartup.equity / 100)) : 0;
        const taxSavingAssets = updatedTaxPlanning.ppfBalance + updatedTaxPlanning.npsBalance;
        const creditCardUsed = state.player.creditCards.reduce((sum, c) => sum + c.used, 0);

        const totalAssets = newCash + portfolioValue + propertyValue + businessEquity + startupValue + taxSavingAssets;
        const totalLiabilities = updatedLoans.reduce((sum, l) => sum + l.remainingAmount, 0) + creditCardUsed;
        const newNetWorth = totalAssets - totalLiabilities;

        // --- 18. FINANCIAL GOALS PROGRESS UPDATE ---
        const updatedGoals = updateGoalProgress(state.goals, {
          ...state,
          player: { ...state.player, cash: newCash, netWorth: newNetWorth },
        });
        const newCompletedGoals = updatedGoals.filter((g, idx) => g.isCompleted && !state.goals[idx].isCompleted);
        let goalTokensEarned = 0;
        for (const goal of newCompletedGoals) {
          goalTokensEarned += goal.reward;
          newToasts.push({
            id: generateId(),
            type: 'achievement',
            title: '🎯 Goal Achieved!',
            message: `${goal.icon} Completed goal: "${goal.title}" — +${goal.reward} tokens!`,
            duration: 6000,
          });
        }

        // --- 19. CHALLENGES PROGRESS UPDATE ---
        const netWorthChange = newNetWorth - state.player.netWorth;
        const updatedChallenges = updateChallengeProgress(
          state.challenges,
          {
            ...state,
            player: { ...state.player, cash: newCash, netWorth: newNetWorth },
            market: { ...state.market, holdings: state.market.holdings }
          },
          monthlyBaseIncome,
          businessIncome,
          netWorthChange
        );
        const newCompletedChallenges = updatedChallenges.filter((c, idx) => c.isCompleted && !state.challenges[idx].isCompleted);
        let challengeTokensEarned = 0;
        for (const challenge of newCompletedChallenges) {
          challengeTokensEarned += challenge.reward;
          newToasts.push({
            id: generateId(),
            type: 'achievement',
            title: '🏆 Challenge Completed!',
            message: `${challenge.icon} "${challenge.title}" — +${challenge.reward} tokens!`,
            duration: 6000,
          });
        }
        let activeChallenges = updatedChallenges.filter((c) => state.meta.currentMonth + 1 <= c.expiresMonth);
        if (activeChallenges.length === 0 || randomChance(0.2)) {
          const newGenerated = generateChallenges(state.meta.currentMonth + 1);
          activeChallenges = [...activeChallenges, ...newGenerated];
        }

        // --- 20. NEWS FEED GENERATION ---
        const monthlyNews = generateMonthlyNews(state);
        const updatedNewsFeed = [...monthlyNews, ...state.newsFeed].slice(0, 50);

        // --- 21. CHECK ACHIEVEMENTS ---
        const newAchievements = [...state.achievements];
        const goldHoldings = updatedCommodityHoldings
          .filter((h) => h.commodityId.includes('gold'))
          .reduce((sum, h) => sum + h.quantity, 0);

        const maxStatusTier = state.player.ownedStatusItems.reduce((max, id) => {
          const item = STATUS_ITEMS.find((s) => s.id === id);
          return item && item.tier > max ? item.tier : max;
        }, 0);

        for (let i = 0; i < newAchievements.length; i++) {
          if (newAchievements[i].isUnlocked) continue;

          const ach = newAchievements[i];
          let unlocked = false;

          switch (ach.condition.type) {
            case 'netWorth':
              unlocked = newNetWorth >= ach.condition.value;
              break;
            case 'cash':
              unlocked = newCash >= ach.condition.value;
              break;
            case 'businesses':
              unlocked = updatedBusinesses.length >= ach.condition.value;
              break;
            case 'stocks':
              unlocked = state.market.holdings.length >= ach.condition.value;
              break;
            case 'debtFree':
              unlocked = updatedLoans.length === 0 && state.meta.currentMonth > 3;
              break;
            case 'monthsPlayed':
              unlocked = state.meta.currentMonth + 1 >= ach.condition.value;
              break;
            case 'job':
              if (ach.condition.value === 1) unlocked = newJob !== null && newJob.monthsWorked === 0;
              if (ach.condition.value === 2) {
                const j = newJob ? JOBS.find((jj) => jj.id === newJob!.jobId) : null;
                unlocked = j?.tier === 'mid' || j?.tier === 'high';
              }
              if (ach.condition.value === 3) {
                const j = newJob ? JOBS.find((jj) => jj.id === newJob!.jobId) : null;
                unlocked = j?.tier === 'high';
              }
              break;
            case 'startup_ipo':
              unlocked = state.startup !== null && updatedStartup === null && (state.startup.stage === 'ipo' || state.startup.stage === 'acquired');
              break;
            case 'family_married':
              unlocked = updatedFamily.relationshipStatus === 'married';
              break;
            case 'status_tier':
              unlocked = maxStatusTier >= ach.condition.value;
              break;
            case 'donation_total':
              unlocked = state.player.totalDonated >= ach.condition.value;
              break;
            case 'sip_count':
              unlocked = updatedSIPs.filter((s) => s.isActive).length >= ach.condition.value;
              break;
            case 'gold_holdings':
              unlocked = goldHoldings >= ach.condition.value;
              break;
            case 'side_hustles':
              unlocked = updatedSideHustles.length >= ach.condition.value;
              break;
            case 'goals_completed':
              unlocked = updatedGoals.filter((g) => g.isCompleted).length >= ach.condition.value;
              break;
          }

          if (unlocked) {
            newAchievements[i] = {
              ...ach,
              isUnlocked: true,
              unlockedAt: state.meta.currentMonth + 1,
            };
            newToasts.push({
              id: generateId(),
              type: 'achievement',
              title: `🏆 Achievement Unlocked!`,
              message: `${ach.icon} ${ach.title} — +${ach.reward} tokens`,
              duration: 5000,
            });
          }
        }

        // Achievement token rewards
        const tokensEarned = newAchievements
          .filter((a) => a.isUnlocked && a.unlockedAt === state.meta.currentMonth + 1)
          .reduce((sum, a) => sum + a.reward, 0);

        const totalTokensAwarded = tokensEarned + goalTokensEarned + challengeTokensEarned;

        // --- 22. BUILD MONTH SUMMARY ---
        const summary: MonthlySummary = {
          month: state.meta.currentMonth + 1,
          income: {
            salary: salaryIncome,
            businessProfit: Math.max(0, businessIncome),
            dividends: dividendIncome,
            rentalIncome,
            sideHustleIncome,
            partnerIncome,
            other: sgbInterestIncome + startupExitCash + maturedGoldWindfall + (eventEffects.cashChange > 0 ? eventEffects.cashChange : 0) + (forexCashAdjustments > 0 ? forexCashAdjustments : 0) + salaryBonusCash,
            total: monthlyBaseIncome + startupExitCash + maturedGoldWindfall + (eventEffects.cashChange > 0 ? eventEffects.cashChange : 0) + (forexCashAdjustments > 0 ? forexCashAdjustments : 0),
          },
          expenses: {
            housing: housingExpense,
            loanEMIs,
            creditCardPayments: 0,
            education: educationExpense,
            lifestyle: lifestyleExpense,
            taxes: monthlyTax,
            insurance: insurancePremiums,
            family: familyExpense,
            sipDeductions,
            other: ppfNpsDeductions + startupBurnPaidByPlayer + (eventEffects.cashChange < 0 ? Math.abs(eventEffects.cashChange) : 0) + (forexCashAdjustments < 0 ? Math.abs(forexCashAdjustments) : 0),
            total: monthlyBaseExpenses + sipDeductions + ppfNpsDeductions + startupBurnPaidByPlayer + (eventEffects.cashChange < 0 ? Math.abs(eventEffects.cashChange) : 0) + (forexCashAdjustments < 0 ? Math.abs(forexCashAdjustments) : 0),
          },
          netChange: newCash - state.player.cash,
          netWorth: newNetWorth,
          previousNetWorth: state.player.netWorth,
          events,
          news: monthlyNews,
          stockPerformance: state.market.holdings.length > 0
            ? ((portfolioValue - state.market.holdings.reduce((s, h) => s + h.totalInvested, 0)) /
                Math.max(1, state.market.holdings.reduce((s, h) => s + h.totalInvested, 0))) * 100
            : 0,
        };

        const eventWithChoices = events.find((e) => e.choices && e.choices.length > 0);

        // --- APPLY ALL UPDATES ---
        set({
          meta: {
            ...state.meta,
            currentMonth: state.meta.currentMonth + 1,
            lastPlayedTimestamp: Date.now(),
            isPaused: true, // Auto-pause on monthly statement!
          },
          player: {
            ...state.player,
            name: state.player.name,
            age: state.player.age + ((state.meta.currentMonth + 1) % 12 === 0 ? 1 : 0),
            cash: newCash,
            netWorth: newNetWorth,
            netWorthHistory: [...state.player.netWorthHistory, newNetWorth].slice(-120),
            monthlyIncome: summary.income.total,
            monthlyExpenses: summary.expenses.total,
            currentJob: newJob,
            completedEducation: newCompletedEducation,
            activeEducation: newActiveEducation,
            skills: newSkills,
            experience: newExperience,
            stats: newStats,
            creditScore: newCreditScore,
            wealthTokens: state.player.wealthTokens + totalTokensAwarded,
            flexScore: calculateFlexScore(state.player.ownedStatusItems),
          },
          market: {
            ...state.market,
            companies: newCompanies,
            cryptoAssets: newCrypto,
            marketTrend: newMarketTrend,
            mutualFunds: updatedMutualFunds,
            mutualFundHoldings: updatedMFHoldings,
            sips: updatedSIPs,
            commodities: updatedCommodities,
            commodityHoldings: updatedCommodityHoldings,
            forexPairs: updatedForexPairs,
            forexPositions: remainingPositions,
          },
          businesses: updatedBusinesses,
          properties: updatedProperties,
          loans: updatedLoans,
          eventHistory: [...state.eventHistory, ...events].slice(-50),
          pendingEvent: eventWithChoices || null,
          achievements: newAchievements,
          monthSummaries: [...state.monthSummaries, summary].slice(-24),
          toasts: [...state.toasts, ...newToasts],
          startup: updatedStartup,
          sideHustles: updatedSideHustles,
          family: updatedFamily,
          insurance: updatedInsurance,
          taxPlanning: updatedTaxPlanning,
          goals: updatedGoals,
          challenges: activeChallenges,
          newsFeed: updatedNewsFeed,
          ui: {
            ...state.ui,
            showMonthSummary: true,
            showEventModal: !!eventWithChoices,
            isAdvancingMonth: false,
          },
        });
      },

      togglePause: () => {
        set((state) => ({
          meta: { ...state.meta, isPaused: !state.meta.isPaused }
        }));
      },

      setGameSpeed: (speed) => {
        set((state) => ({
          meta: { ...state.meta, gameSpeed: speed, isPaused: speed === 0 }
        }));
      },

      keepPlayingInfinite: () => {
        set((state) => ({
          meta: {
            ...state.meta,
            infiniteModeActive: true,
            totalMonths: 0
          }
        }));
        get().addToast({
          type: 'success',
          title: 'Infinite Mode Active 🚀',
          message: 'Retirement declined. Build your empire indefinitely!'
        });
      },

      tickDaily: () => {
        const state = get();
        if (state.meta.isPaused) return;

        if (state.ui.showMonthSummary || state.ui.showEventModal || state.ui.showNewGameModal) {
          set((s) => ({ meta: { ...s.meta, isPaused: true } }));
          return;
        }

        let newDay = state.meta.currentDay + 1;
        let speedBoostDays = state.meta.speedBoostRemainingDays;
        let currentSpeed = state.meta.gameSpeed;
        const newToasts: ToastNotification[] = [];

        if (speedBoostDays > 0) {
          speedBoostDays -= 1;
          if (speedBoostDays === 0) {
            currentSpeed = 1;
            newToasts.push({
              id: generateId(),
              type: 'info',
              title: 'Speed Boost Ended',
              message: 'Your time speed boost has expired. Speed returned to 1x.',
            });
          }
        }

        if (newDay > 30) {
          set((s) => ({
            meta: {
              ...s.meta,
              currentDay: 1,
              speedBoostRemainingDays: speedBoostDays,
              gameSpeed: currentSpeed,
            },
            toasts: [...s.toasts, ...newToasts],
          }));

          get().advanceMonth();
          return;
        }

        const seasonalMods = calculateSeasonalMultipliers(state.meta.currentMonth + 1);
        const eventStockMultiplier = state.pendingEvent ? 1.0 : 1.0;

        const sectorMultipliers: Record<string, number> = {};

        const { companies: newCompanies, cryptoAssets: newCrypto, commodities: updatedCommodities, forexPairs: updatedForexPairs } = updateMarketDaily(
          state.market.companies,
          state.market.cryptoAssets,
          state.market.commodities,
          state.market.forexPairs,
          state.market.volatilityIndex,
          eventStockMultiplier * seasonalMods.stockMarket,
          sectorMultipliers,
          state.market.marketTrend
        );

        let forexCashAdjustments = 0;
        const remainingPositions: ForexPosition[] = [];

        for (const pos of state.market.forexPositions) {
          const pair = updatedForexPairs.find((p) => p.id === pos.pairId);
          if (!pair) {
            remainingPositions.push(pos);
            continue;
          }

          const currentRate = pair.currentRate;
          const profitLoss = calculateForexPnL({
            type: pos.type,
            entryRate: pos.entryRate,
            currentRate,
            lotSize: pos.lotSize,
            leverage: pos.leverage,
          });

          let triggerClose = false;
          let closeReason = '';
          let finalProceeds = pos.margin + profitLoss;

          if (profitLoss <= -pos.margin) {
            triggerClose = true;
            closeReason = 'Margin Liquidation 🚨';
            finalProceeds = 0;
          } else if (pos.stopLoss && (
            (pos.type === 'long' && currentRate <= pos.stopLoss) ||
            (pos.type === 'short' && currentRate >= pos.stopLoss)
          )) {
            triggerClose = true;
            closeReason = 'Stop Loss Hit 🛑';
          } else if (pos.takeProfit && (
            (pos.type === 'long' && currentRate >= pos.takeProfit) ||
            (pos.type === 'short' && currentRate <= pos.takeProfit)
          )) {
            triggerClose = true;
            closeReason = 'Take Profit Hit 🎯';
          }

          if (triggerClose) {
            forexCashAdjustments += finalProceeds;
            newToasts.push({
              id: generateId(),
              type: profitLoss >= 0 ? 'success' : 'error',
              title: closeReason,
              message: `Forex position ${pos.type.toUpperCase()} ${pos.pairId} closed automatically. P&L: ₹${profitLoss.toLocaleString()}`,
            });
          } else {
            remainingPositions.push({
              ...pos,
              currentRate,
              profitLoss,
            });
          }
        }

        const currentPortfolioValue = calculatePortfolioValue({
          ...state,
          market: {
            ...state.market,
            companies: newCompanies,
            cryptoAssets: newCrypto,
            commodities: updatedCommodities,
            forexPairs: updatedForexPairs,
            forexPositions: remainingPositions,
          },
        });

        const propertyValue = state.properties
          .filter((p) => p.currentValue > 0)
          .reduce((sum, p) => sum + p.currentValue, 0);

        const businessEquity = state.businesses.reduce((sum, b) => {
          const template = BUSINESS_TEMPLATES.find((t) => t.id === b.templateId);
          const annualProfit = (b.monthlyRevenue - b.monthlyExpenses) * 12;
          return sum + Math.max(template?.startupCost || 0, annualProfit * 5);
        }, 0);

        const startupValue = state.startup ? Math.round(state.startup.valuation * (state.startup.equity / 100)) : 0;
        const taxSavingAssets = state.taxPlanning.ppfBalance + state.taxPlanning.npsBalance;
        const creditCardUsed = state.player.creditCards.reduce((sum, c) => sum + c.used, 0);
        const loansTotal = state.loans.reduce((sum, l) => sum + l.remainingAmount, 0);

        const dailyNetWorth = state.player.cash + forexCashAdjustments + currentPortfolioValue + propertyValue + businessEquity + startupValue + taxSavingAssets - loansTotal - creditCardUsed;

        set((s) => ({
          meta: {
            ...s.meta,
            currentDay: newDay,
            speedBoostRemainingDays: speedBoostDays,
            gameSpeed: currentSpeed,
          },
          player: {
            ...s.player,
            cash: Math.max(0, s.player.cash + forexCashAdjustments),
            netWorth: dailyNetWorth,
          },
          market: {
            ...s.market,
            companies: newCompanies,
            cryptoAssets: newCrypto,
            commodities: updatedCommodities,
            forexPairs: updatedForexPairs,
            forexPositions: remainingPositions,
          },
          toasts: [...s.toasts, ...newToasts],
        }));
      },

      skipTime: (months) => {
        const state = get();
        const costMap: Record<number, number> = { 1: 15, 3: 40, 12: 150 };
        const cost = costMap[months] || 999;

        if (state.player.wealthTokens < cost) {
          get().addToast({
            type: 'error',
            title: 'Not Enough Stars',
            message: `Requires ${cost} Stars. You have ${state.player.wealthTokens}.`
          });
          return false;
        }

        set((s) => ({
          player: {
            ...s.player,
            wealthTokens: s.player.wealthTokens - cost
          },
          meta: {
            ...s.meta,
            isPaused: true
          }
        }));

        get().addToast({
          type: 'success',
          title: 'Time Warp Engaged! ⚡',
          message: `Skipping ahead ${months} Month(s)...`,
        });

        for (let i = 0; i < months; i++) {
          const isLast = i === months - 1;
          get().advanceMonth();
          if (!isLast) {
            set((s) => ({ ui: { ...s.ui, showMonthSummary: false } }));
          }
        }

        return true;
      },

      buySpeedBoost: (boostType) => {
        const state = get();
        const starCost = boostType === '3x_1mo' ? 5 : 12;
        const durationDays = boostType === '3x_1mo' ? 30 : 90;
        const targetSpeed = boostType === '3x_1mo' ? 3 : 5;

        if (state.player.wealthTokens < starCost) {
          get().addToast({
            type: 'error',
            title: 'Not Enough Stars',
            message: `Requires ${starCost} Stars to activate.`
          });
          return false;
        }

        set((s) => ({
          player: {
            ...s.player,
            wealthTokens: s.player.wealthTokens - starCost
          },
          meta: {
            ...s.meta,
            gameSpeed: targetSpeed,
            speedBoostRemainingDays: durationDays,
            isPaused: false
          }
        }));

        get().addToast({
          type: 'success',
          title: 'Speed Boost Activated! 🚀',
          message: `${targetSpeed}x Speed active for the next ${durationDays} days!`
        });

        return true;
      },

      // ========================
      // JOB ACTIONS
      // ========================

      applyForJob: (jobId) => {
        const state = get();
        const job = JOBS.find((j) => j.id === jobId);
        if (!job) return false;

        // Check requirements
        for (const eduId of job.requirements.education) {
          if (!state.player.completedEducation.includes(eduId)) return false;
        }
        for (const [skill, level] of Object.entries(job.requirements.skills)) {
          if ((state.player.skills[skill as SkillType] || 0) < (level || 0)) return false;
        }
        if (state.player.experience < job.requirements.experience) return false;
        if (job.requirements.creditScore && state.player.creditScore < job.requirements.creditScore) return false;

        set({
          player: {
            ...state.player,
            currentJob: {
              jobId,
              monthsWorked: 0,
              performance: 50 + (state.player.stats.motivation - 50) * 0.3,
              lastPromotionCheck: 0,
            },
          },
        });

        get().addToast({ type: 'success', title: 'Job Secured!', message: `You are now a ${job.title}` });
        return true;
      },

      quitJob: () => {
        const state = get();
        set({
          player: { ...state.player, currentJob: null },
        });
        get().addToast({ type: 'info', title: 'Job Resigned', message: 'You quit your job.' });
      },

      // ========================
      // EDUCATION ACTIONS
      // ========================

      enrollEducation: (educationId) => {
        const state = get();
        if (state.player.activeEducation) return false;

        const edu = EDUCATION_COURSES.find((e) => e.id === educationId);
        if (!edu) return false;
        if (state.player.completedEducation.includes(educationId)) return false;

        // Check prerequisites
        for (const prereq of edu.prerequisites) {
          if (!state.player.completedEducation.includes(prereq)) return false;
        }

        // Check if player can afford first month
        if (state.player.cash < edu.costPerMonth) return false;

        set({
          player: {
            ...state.player,
            activeEducation: {
              educationId,
              monthsCompleted: 0,
              totalMonths: edu.duration,
              isCompleted: false,
            },
          },
        });

        get().addToast({ type: 'info', title: 'Enrolled!', message: `Started ${edu.name}` });
        return true;
      },

      dropEducation: () => {
        const state = get();
        set({
          player: { ...state.player, activeEducation: null },
        });
      },

      // ========================
      // STOCK ACTIONS
      // ========================

      buyStock: (companyId, shares) => {
        const state = get();
        const company = state.market.companies.find((c) => c.id === companyId);
        if (!company || shares <= 0) return false;

        const cost = company.currentPrice * shares;
        if (state.player.cash < cost) return false;

        const existing = state.market.holdings.find((h) => h.companyId === companyId);
        let newHoldings: StockHolding[];

        if (existing) {
          newHoldings = state.market.holdings.map((h) =>
            h.companyId === companyId
              ? {
                  ...h,
                  shares: h.shares + shares,
                  totalInvested: h.totalInvested + cost,
                  avgBuyPrice: (h.totalInvested + cost) / (h.shares + shares),
                }
              : h
          );
        } else {
          newHoldings = [
            ...state.market.holdings,
            {
              companyId,
              shares,
              avgBuyPrice: company.currentPrice,
              totalInvested: cost,
            },
          ];
        }

        set({
          player: { ...state.player, cash: state.player.cash - cost },
          market: { ...state.market, holdings: newHoldings },
        });

        get().addToast({
          type: 'success',
          title: `Bought ${company.ticker}`,
          message: `${shares} shares at ₹${Math.round(company.currentPrice)}`,
        });
        return true;
      },

      sellStock: (companyId, shares) => {
        const state = get();
        const company = state.market.companies.find((c) => c.id === companyId);
        const holding = state.market.holdings.find((h) => h.companyId === companyId);
        if (!company || !holding || shares <= 0 || shares > holding.shares) return false;

        const proceeds = company.currentPrice * shares;
        const costBasis = holding.avgBuyPrice * shares;
        const profit = proceeds - costBasis;

        let newHoldings: StockHolding[];
        if (shares === holding.shares) {
          newHoldings = state.market.holdings.filter((h) => h.companyId !== companyId);
        } else {
          newHoldings = state.market.holdings.map((h) =>
            h.companyId === companyId
              ? {
                  ...h,
                  shares: h.shares - shares,
                  totalInvested: h.totalInvested - costBasis,
                }
              : h
          );
        }

        set({
          player: { ...state.player, cash: state.player.cash + proceeds },
          market: { ...state.market, holdings: newHoldings },
        });

        get().addToast({
          type: profit >= 0 ? 'success' : 'warning',
          title: `Sold ${company.ticker}`,
          message: `${shares} shares — ${profit >= 0 ? 'Profit' : 'Loss'}: ₹${Math.abs(Math.round(profit)).toLocaleString()}`,
        });
        return true;
      },

      buyCrypto: (cryptoId, amount) => {
        const state = get();
        const crypto = state.market.cryptoAssets.find((c) => c.id === cryptoId);
        if (!crypto || amount <= 0) return false;
        if (state.player.cash < amount) return false;

        const units = amount / crypto.currentPrice;
        const existing = state.market.cryptoHoldings.find((h) => h.cryptoId === cryptoId);
        let newHoldings: CryptoHolding[];

        if (existing) {
          newHoldings = state.market.cryptoHoldings.map((h) =>
            h.cryptoId === cryptoId
              ? {
                  ...h,
                  units: h.units + units,
                  totalInvested: h.totalInvested + amount,
                  avgBuyPrice: (h.totalInvested + amount) / (h.units + units),
                }
              : h
          );
        } else {
          newHoldings = [
            ...state.market.cryptoHoldings,
            { cryptoId, units, avgBuyPrice: crypto.currentPrice, totalInvested: amount },
          ];
        }

        set({
          player: { ...state.player, cash: state.player.cash - amount },
          market: { ...state.market, cryptoHoldings: newHoldings },
        });
        return true;
      },

      sellCrypto: (cryptoId, units) => {
        const state = get();
        const crypto = state.market.cryptoAssets.find((c) => c.id === cryptoId);
        const holding = state.market.cryptoHoldings.find((h) => h.cryptoId === cryptoId);
        if (!crypto || !holding || units <= 0 || units > holding.units) return false;

        const proceeds = crypto.currentPrice * units;

        let newHoldings: CryptoHolding[];
        if (Math.abs(units - holding.units) < 0.0001) {
          newHoldings = state.market.cryptoHoldings.filter((h) => h.cryptoId !== cryptoId);
        } else {
          const costBasis = holding.avgBuyPrice * units;
          newHoldings = state.market.cryptoHoldings.map((h) =>
            h.cryptoId === cryptoId
              ? { ...h, units: h.units - units, totalInvested: h.totalInvested - costBasis }
              : h
          );
        }

        set({
          player: { ...state.player, cash: state.player.cash + proceeds },
          market: { ...state.market, cryptoHoldings: newHoldings },
        });
        return true;
      },

      // ========================
      // BUSINESS ACTIONS
      // ========================

      startBusiness: (templateId) => {
        const state = get();
        const template = BUSINESS_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return false;
        if (state.player.cash < template.startupCost) return false;

        // Check requirements
        if (template.requirements.reputation && state.player.stats.reputation < template.requirements.reputation) return false;
        if (template.requirements.skills) {
          for (const [skill, level] of Object.entries(template.requirements.skills)) {
            if ((state.player.skills[skill as SkillType] || 0) < (level || 0)) return false;
          }
        }

        const newBiz: OwnedBusiness = {
          id: generateId(),
          templateId,
          name: template.name,
          level: 1,
          monthlyRevenue: template.monthlyRevenue,
          monthlyExpenses: template.monthlyExpenses,
          monthsOwned: 0,
          totalProfit: 0,
          purchasedUpgrades: [],
          employees: template.tier === 'solo' ? 0 : 1,
          health: 80,
          consecutiveLossMonths: 0,
        };

        set({
          player: { ...state.player, cash: state.player.cash - template.startupCost },
          businesses: [...state.businesses, newBiz],
        });

        get().addToast({ type: 'success', title: 'Business Started!', message: `${template.name} is now operational.` });
        return true;
      },

      upgradeBusiness: (businessId, upgradeId) => {
        const state = get();
        const biz = state.businesses.find((b) => b.id === businessId);
        if (!biz) return false;

        const template = BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId);
        if (!template) return false;

        const upgrade = template.upgrades.find((u) => u.id === upgradeId);
        if (!upgrade) return false;
        if (biz.purchasedUpgrades.includes(upgradeId)) return false;
        if (state.player.cash < upgrade.cost) return false;

        set({
          player: { ...state.player, cash: state.player.cash - upgrade.cost },
          businesses: state.businesses.map((b) =>
            b.id === businessId
              ? {
                  ...b,
                  monthlyRevenue: Math.round(b.monthlyRevenue * upgrade.revenueBoost),
                  monthlyExpenses: Math.round(b.monthlyExpenses * upgrade.expenseReduction),
                  purchasedUpgrades: [...b.purchasedUpgrades, upgradeId],
                  level: b.level + 1,
                  health: clamp(b.health + 10, 0, 100),
                }
              : b
          ),
        });

        get().addToast({ type: 'success', title: 'Upgrade Complete!', message: upgrade.name });
        return true;
      },

      sellBusiness: (businessId) => {
        const state = get();
        const biz = state.businesses.find((b) => b.id === businessId);
        if (!biz) return;

        const template = BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId);
        // Valuation: max of startup cost or 5x annual profit
        const annualProfit = (biz.monthlyRevenue - biz.monthlyExpenses) * 12;
        const valuation = Math.max(template?.startupCost || 0, annualProfit * 5) * 0.8; // 80% of valuation on sale

        set({
          player: { ...state.player, cash: state.player.cash + valuation },
          businesses: state.businesses.filter((b) => b.id !== businessId),
        });

        get().addToast({ type: 'info', title: 'Business Sold', message: `Sold for ₹${Math.round(valuation).toLocaleString()}` });
      },

      // ========================
      // PROPERTY ACTIONS
      // ========================

      changeHousing: (propertyId) => {
        const state = get();
        set({
          properties: state.properties.map((p) => {
            if (p.id === state.properties.find((pp) => pp.isPlayerHome)?.id) {
              // If the old home was rental, remove it
              const template = PROPERTY_TEMPLATES.find((t) => t.id === p.templateId);
              if (template?.type === 'rental') return null as unknown as OwnedProperty;
            }
            return p;
          }).filter(Boolean),
        });

        // Find or create the new housing
        const template = PROPERTY_TEMPLATES.find((t) => t.id === propertyId);
        if (!template) return;

        const existing = get().properties.find((p) => p.templateId === propertyId && !p.isPlayerHome);
        if (existing) {
          set({
            properties: get().properties.map((p) =>
              p.id === existing.id ? { ...p, isPlayerHome: true } : { ...p, isPlayerHome: false }
            ),
          });
        } else {
          set({
            properties: [
              ...get().properties.map((p) => ({ ...p, isPlayerHome: false })),
              {
                id: generateId(),
                templateId: propertyId,
                purchasePrice: 0,
                currentValue: 0,
                monthsOwned: 0,
                isPlayerHome: true,
                monthlyRentIncome: 0,
              },
            ],
          });
        }

        get().addToast({ type: 'info', title: 'Moved!', message: `Now living in ${template.name}` });
      },

      buyProperty: (templateId) => {
        const state = get();
        const template = PROPERTY_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return false;

        const downPayment = template.purchasePrice * 0.3;
        if (state.player.cash < downPayment) return false;
        if (template.requirements.creditScore && state.player.creditScore < template.requirements.creditScore) return false;

        // Auto-create mortgage for the rest
        const loanAmount = template.purchasePrice - downPayment;
        const mortgage: Loan = {
          id: generateId(),
          type: 'home',
          principal: loanAmount,
          remainingAmount: loanAmount,
          interestRate: 0.085,
          monthlyEMI: calculateEMI(loanAmount, 0.085, 240),
          totalMonths: 240,
          monthsPaid: 0,
          missedPayments: 0,
          description: `Mortgage for ${template.name}`,
        };

        const newProperty: OwnedProperty = {
          id: generateId(),
          templateId,
          purchasePrice: template.purchasePrice,
          currentValue: template.purchasePrice,
          monthsOwned: 0,
          isPlayerHome: false,
          monthlyRentIncome: template.monthlyRent,
          mortgageId: mortgage.id,
        };

        set({
          player: { ...state.player, cash: state.player.cash - downPayment },
          properties: [...state.properties, newProperty],
          loans: [...state.loans, mortgage],
        });

        get().addToast({ type: 'success', title: 'Property Purchased!', message: template.name });
        return true;
      },

      sellProperty: (propertyId) => {
        const state = get();
        const prop = state.properties.find((p) => p.id === propertyId);
        if (!prop || prop.isPlayerHome) return;

        const salePrice = prop.currentValue * 0.95; // 5% selling cost

        // Pay off mortgage if exists
        let remainingProceeds = salePrice;
        let updatedLoans = state.loans;
        if (prop.mortgageId) {
          const mortgage = state.loans.find((l) => l.id === prop.mortgageId);
          if (mortgage) {
            remainingProceeds -= mortgage.remainingAmount;
            updatedLoans = state.loans.filter((l) => l.id !== prop.mortgageId);
          }
        }

        set({
          player: { ...state.player, cash: state.player.cash + Math.max(0, remainingProceeds) },
          properties: state.properties.filter((p) => p.id !== propertyId),
          loans: updatedLoans,
        });

        get().addToast({ type: 'info', title: 'Property Sold', message: `Proceeds: ₹${Math.round(Math.max(0, remainingProceeds)).toLocaleString()}` });
      },

      // ========================
      // LOAN ACTIONS
      // ========================

      takeLoan: (type, amount, months) => {
        const state = get();

        // Interest rate based on credit score and type
        const baseRates: Record<string, number> = {
          personal: 0.12,
          business: 0.14,
          home: 0.085,
          education: 0.08,
        };
        const creditBonus = (state.player.creditScore - 500) * 0.0001;
        const rate = Math.max(0.05, (baseRates[type] || 0.12) - creditBonus);

        // Check eligibility
        const totalDebt = state.loans.reduce((sum, l) => sum + l.remainingAmount, 0);
        const monthlyIncome = state.player.monthlyIncome || 1;
        if ((totalDebt + amount) / (monthlyIncome * 12) > 0.5) return false;

        const loan: Loan = {
          id: generateId(),
          type: type as Loan['type'],
          principal: amount,
          remainingAmount: amount,
          interestRate: rate,
          monthlyEMI: calculateEMI(amount, rate, months),
          totalMonths: months,
          monthsPaid: 0,
          missedPayments: 0,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} Loan`,
        };

        set({
          player: { ...state.player, cash: state.player.cash + amount },
          loans: [...state.loans, loan],
        });

        get().addToast({ type: 'info', title: 'Loan Approved', message: `₹${amount.toLocaleString()} at ${(rate * 100).toFixed(1)}%` });
        return true;
      },

      payOffLoan: (loanId) => {
        const state = get();
        const loan = state.loans.find((l) => l.id === loanId);
        if (!loan) return false;
        if (state.player.cash < loan.remainingAmount) return false;

        set({
          player: {
            ...state.player,
            cash: state.player.cash - loan.remainingAmount,
            creditScore: clamp(state.player.creditScore + 20, 300, 900),
          },
          loans: state.loans.filter((l) => l.id !== loanId),
        });

        get().addToast({ type: 'success', title: 'Loan Paid Off!', message: 'Credit score improved!' });
        return true;
      },

      // ========================
      // LIFESTYLE
      // ========================

      toggleLifestyle: (choiceId) => {
        const state = get();
        const isActive = state.player.activeLifestyle.includes(choiceId);
        set({
          player: {
            ...state.player,
            activeLifestyle: isActive
              ? state.player.activeLifestyle.filter((id) => id !== choiceId)
              : [...state.player.activeLifestyle, choiceId],
          },
        });
      },

      // ========================
      // EVENT HANDLING
      // ========================

      handleEventChoice: (choiceIndex) => {
        const state = get();
        if (!state.pendingEvent || !state.pendingEvent.choices) return;

        const choice = state.pendingEvent.choices[choiceIndex];
        if (!choice) return;

        const effects = applyEventEffects(choice.effects, state);

        set({
          player: {
            ...state.player,
            cash: state.player.cash + (effects.cashChange || 0),
            stats: {
              ...state.player.stats,
              ...Object.fromEntries(
                Object.entries(effects.statsChanges || {}).map(([k, v]) => [
                  k,
                  clamp(((state.player.stats as unknown as Record<string, number>)[k] || 0) + (v || 0), 0, 100),
                ])
              ),
            },
          },
          pendingEvent: null,
          ui: { ...state.ui, showEventModal: false },
        });
      },

      dismissEvent: () => {
        set((state) => ({
          pendingEvent: null,
          ui: { ...state.ui, showEventModal: false },
        }));
      },

      // ========================
      // UI ACTIONS
      // ========================

      setScreen: (screen) => {
        set((state) => ({ ui: { ...state.ui, currentScreen: screen } }));
      },

      dismissMonthSummary: () => {
        set((state) => ({
          ui: { ...state.ui, showMonthSummary: false },
        }));
      },

      addToast: (toast) => {
        const id = generateId();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        // Auto-remove after duration
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, toast.duration || 4000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      toggleSound: () => {
        set((state) => ({
          meta: { ...state.meta, soundEnabled: !state.meta.soundEnabled },
        }));
      },

      toggleReducedMotion: () => {
        set((state) => ({
          meta: { ...state.meta, reducedMotion: !state.meta.reducedMotion },
        }));
      },

      // --- Phase 2 Actions Implementation ---

      setSubTab: (tab) => {
        set((state) => ({ ui: { ...state.ui, activeSubTab: tab } }));
      },

      buyMutualFund: (fundId, amount) => {
        const state = get();
        if (state.player.cash < amount) return false;
        const fund = state.market.mutualFunds.find((f) => f.id === fundId);
        if (!fund || amount < fund.minInvestment) return false;

        const units = +(amount / fund.nav).toFixed(4);
        const existingIndex = state.market.mutualFundHoldings.findIndex((h) => h.fundId === fundId);

        let updatedHoldings = [...state.market.mutualFundHoldings];
        if (existingIndex >= 0) {
          const existing = updatedHoldings[existingIndex];
          const newTotalInvested = existing.totalInvested + amount;
          const newUnits = existing.units + units;
          updatedHoldings[existingIndex] = {
            ...existing,
            units: newUnits,
            totalInvested: newTotalInvested,
            avgNav: +(newTotalInvested / newUnits).toFixed(4),
          };
        } else {
          updatedHoldings.push({
            fundId,
            units,
            avgNav: fund.nav,
            totalInvested: amount,
            purchaseMonth: state.meta.currentMonth,
          });
        }

        set({
          player: { ...state.player, cash: state.player.cash - amount },
          market: {
            ...state.market,
            mutualFundHoldings: updatedHoldings,
          },
        });

        get().addToast({
          type: 'success',
          title: 'Mutual Fund Purchased',
          message: `Invested ₹${amount.toLocaleString()} in ${fund.name}`,
        });
        return true;
      },

      sellMutualFund: (holdingIndex) => {
        const state = get();
        const holding = state.market.mutualFundHoldings[holdingIndex];
        if (!holding) return false;

        const fund = state.market.mutualFunds.find((f) => f.id === holding.fundId);
        if (!fund) return false;

        if (fund.lockInMonths > 0) {
          const monthsPassed = state.meta.currentMonth - holding.purchaseMonth;
          if (monthsPassed < fund.lockInMonths) {
            get().addToast({
              type: 'error',
              title: 'Investment Locked',
              message: `Locked in for another ${fund.lockInMonths - monthsPassed} months.`,
            });
            return false;
          }
        }

        const value = Math.round(holding.units * fund.nav);
        const profit = value - holding.totalInvested;

        let tax = 0;
        const monthsOwned = state.meta.currentMonth - holding.purchaseMonth;
        if (profit > 0) {
          if (monthsOwned >= 12) {
            tax = calculateLTCG(profit);
          } else {
            tax = calculateSTCG(profit);
          }
        }

        const proceeds = value - tax;
        const updatedHoldings = state.market.mutualFundHoldings.filter((_, idx) => idx !== holdingIndex);

        set({
          player: { ...state.player, cash: state.player.cash + proceeds },
          market: {
            ...state.market,
            mutualFundHoldings: updatedHoldings,
          },
        });

        get().addToast({
          type: 'success',
          title: 'Mutual Fund Sold',
          message: `Sold units for ₹${value.toLocaleString()}.${tax > 0 ? ` Paid ₹${tax.toLocaleString()} tax.` : ''}`,
        });
        return true;
      },

      startSIP: (fundId, monthlyAmount) => {
        const state = get();
        const fund = state.market.mutualFunds.find((f) => f.id === fundId);
        if (!fund || monthlyAmount < fund.minInvestment) return false;

        const existingSIP = state.market.sips.find((s) => s.fundId === fundId && s.isActive);
        if (existingSIP) {
          get().addToast({
            type: 'error',
            title: 'SIP Already Active',
            message: `You already have an active SIP for ${fund.name}`,
          });
          return false;
        }

        const sip: SIPInvestment = {
          id: generateId(),
          fundId,
          monthlyAmount,
          startMonth: state.meta.currentMonth,
          isActive: true,
          totalInvested: 0,
          unitsAccumulated: 0,
        };

        set({
          market: {
            ...state.market,
            sips: [...state.market.sips, sip],
          },
        });

        get().addToast({
          type: 'success',
          title: 'SIP Started!',
          message: `₹${monthlyAmount.toLocaleString()}/month set for ${fund.name}`,
        });
        return true;
      },

      stopSIP: (sipId) => {
        set((state) => ({
          market: {
            ...state.market,
            sips: state.market.sips.map((s) => (s.id === sipId ? { ...s, isActive: false } : s)),
          },
        }));
        get().addToast({
          type: 'info',
          title: 'SIP Paused',
          message: 'Monthly automated investments stopped.',
        });
      },

      buyCommodity: (commodityId, quantity) => {
        const state = get();
        const commodity = state.market.commodities.find((c) => c.id === commodityId);
        if (!commodity) return false;

        const cost = Math.round(quantity * commodity.pricePerUnit);
        if (state.player.cash < cost) return false;

        const existingIndex = state.market.commodityHoldings.findIndex((h) => h.commodityId === commodityId);
        let updatedHoldings = [...state.market.commodityHoldings];

        if (existingIndex >= 0) {
          const existing = updatedHoldings[existingIndex];
          const newTotalInvested = existing.totalInvested + cost;
          const newQty = existing.quantity + quantity;
          updatedHoldings[existingIndex] = {
            ...existing,
            quantity: newQty,
            totalInvested: newTotalInvested,
            avgBuyPrice: +(newTotalInvested / newQty).toFixed(2),
          };
        } else {
          updatedHoldings.push({
            commodityId,
            quantity,
            avgBuyPrice: commodity.pricePerUnit,
            totalInvested: cost,
            purchaseMonth: state.meta.currentMonth,
          });
        }

        set({
          player: { ...state.player, cash: state.player.cash - cost },
          market: {
            ...state.market,
            commodityHoldings: updatedHoldings,
          },
        });

        get().addToast({
          type: 'success',
          title: 'Commodity Purchased',
          message: `Bought ${quantity}g of ${commodity.name}`,
        });
        return true;
      },

      sellCommodity: (holdingIndex) => {
        const state = get();
        const holding = state.market.commodityHoldings[holdingIndex];
        if (!holding) return false;

        const commodity = state.market.commodities.find((c) => c.id === holding.commodityId);
        if (!commodity) return false;

        if (commodity.type === 'sgb') {
          const monthsPassed = state.meta.currentMonth - holding.purchaseMonth;
          if (monthsPassed < commodity.maturityMonths) {
            get().addToast({
              type: 'error',
              title: 'Bond Locked',
              message: `Maturity in ${commodity.maturityMonths - monthsPassed} months. Can only sell then.`,
            });
            return false;
          }
        }

        const value = Math.round(holding.quantity * commodity.pricePerUnit);
        const profit = value - holding.totalInvested;

        let tax = 0;
        if (commodity.type !== 'sgb' && profit > 0) {
          const monthsOwned = state.meta.currentMonth - holding.purchaseMonth;
          tax = monthsOwned >= 36 ? calculateLTCG(profit) : calculateSTCG(profit);
        }

        const proceeds = value - tax;
        const updatedHoldings = state.market.commodityHoldings.filter((_, idx) => idx !== holdingIndex);

        set({
          player: { ...state.player, cash: state.player.cash + proceeds },
          market: {
            ...state.market,
            commodityHoldings: updatedHoldings,
          },
        });

        get().addToast({
          type: 'success',
          title: 'Commodity Sold',
          message: `Sold for ₹${value.toLocaleString()}.${tax > 0 ? ` Paid ₹${tax.toLocaleString()} tax.` : ''}`,
        });
        return true;
      },

      buyInsurance: (policyId) => {
        const state = get();
        const policy = INSURANCE_POLICIES.find((p) => p.id === policyId);
        if (!policy) return false;

        const existing = state.insurance.find((ins) => {
          const p = INSURANCE_POLICIES.find((po) => po.id === ins.policyId);
          return p && p.type === policy.type;
        });

        if (existing) {
          get().addToast({
            type: 'error',
            title: 'Policy Exists',
            message: `You already have active ${policy.type} insurance. Cancel it first.`,
          });
          return false;
        }

        let actualPremium = policy.monthlyPremium;
        if (policy.type === 'property') {
          const playerProperty = state.properties.find((p) => !p.isPlayerHome) || state.properties[0];
          const val = playerProperty ? playerProperty.currentValue : 5000000;
          actualPremium = calculateAssetPremium(val, 0.005);
        } else if (policy.type === 'vehicle') {
          const car = state.player.ownedStatusItems.find((i) => {
            const statusItem = STATUS_ITEMS.find((s) => s.id === i);
            return statusItem && statusItem.category === 'vehicle';
          });
          const itemData = STATUS_ITEMS.find((s) => s.id === car);
          const val = itemData ? itemData.cost : 1000000;
          actualPremium = calculateAssetPremium(val, 0.02);
        }

        if (state.player.cash < actualPremium) return false;

        const newIns: ActiveInsurance = {
          policyId,
          startMonth: state.meta.currentMonth,
          totalPremiumPaid: actualPremium,
          claimsCount: 0,
          totalClaimedAmount: 0,
        };

        set({
          player: { ...state.player, cash: state.player.cash - actualPremium },
          insurance: [...state.insurance, newIns],
        });

        get().addToast({
          type: 'success',
          title: 'Insurance Purchased!',
          message: `${policy.name} is now active.`,
        });
        return true;
      },

      cancelInsurance: (policyId) => {
        set((state) => ({
          insurance: state.insurance.filter((ins) => ins.policyId !== policyId),
        }));
        get().addToast({
          type: 'info',
          title: 'Insurance Cancelled',
          message: 'You are no longer covered by this policy.',
        });
      },

      startSideHustle: (hustleId) => {
        const state = get();
        const hustle = SIDE_HUSTLES.find((h) => h.id === hustleId);
        if (!hustle) return false;

        if (state.sideHustles.some((sh) => sh.hustleId === hustleId)) return false;

        if (hustle.requirements?.skills) {
          for (const [skill, val] of Object.entries(hustle.requirements.skills)) {
            if (((state.player.skills as unknown as Record<string, number>)[skill] || 0) < (val || 0)) {
              get().addToast({
                type: 'error',
                title: 'Insufficient Skills',
                message: `Requires ${skill} level ${val}.`,
              });
              return false;
            }
          }
        }

        const activeHustle: ActiveSideHustle = {
          hustleId,
          monthsActive: 0,
          currentIncome: hustle.baseIncome,
          totalEarned: 0,
        };

        set({
          sideHustles: [...state.sideHustles, activeHustle],
        });

        get().addToast({
          type: 'success',
          title: 'Side Hustle Started!',
          message: `Started ${hustle.name} as a side hustle.`,
        });
        return true;
      },

      stopSideHustle: (hustleId) => {
        set((state) => ({
          sideHustles: state.sideHustles.filter((sh) => sh.hustleId !== hustleId),
        }));
        get().addToast({
          type: 'info',
          title: 'Hustle Stopped',
          message: 'Stopped working on this side hustle.',
        });
      },

      buyStatusItem: (itemId) => {
        const state = get();
        const item = STATUS_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;

        if (state.player.ownedStatusItems.includes(itemId)) {
          get().addToast({
            type: 'error',
            title: 'Already Owned',
            message: `You already own ${item.name}`,
          });
          return false;
        }

        if (state.player.cash < item.cost) return false;

        const updatedOwned = [...state.player.ownedStatusItems, itemId];
        const newFlexScore = calculateFlexScore(updatedOwned);

        set({
          player: {
            ...state.player,
            cash: state.player.cash - item.cost,
            ownedStatusItems: updatedOwned,
            flexScore: newFlexScore,
            stats: {
              ...state.player.stats,
              reputation: clamp(state.player.stats.reputation + item.reputationBoost, 0, 100),
              happiness: clamp(state.player.stats.happiness + item.happinessBoost, 0, 100),
            },
          },
        });

        get().addToast({
          type: 'success',
          title: 'Purchased Status Flex!',
          message: `Bought ${item.name} (${item.icon})! Flex Score: ${newFlexScore}`,
        });
        return true;
      },

      addGoal: (goal) => {
        set((state) => ({
          goals: [...state.goals, goal],
        }));
        get().addToast({
          type: 'success',
          title: 'New Financial Goal!',
          message: `${goal.title}: Reach ₹${goal.targetAmount.toLocaleString()}`,
        });
      },

      removeGoal: (goalId) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        }));
      },

      makeDonation: (cause, amount) => {
        const state = get();
        if (state.player.cash < amount) return false;

        const donation: DonationRecord = {
          id: generateId(),
          cause,
          amount,
          month: state.meta.currentMonth,
          taxDeductionPercent: 50,
          reputationGain: Math.floor(amount / 10000),
        };

        set({
          player: {
            ...state.player,
            cash: state.player.cash - amount,
            totalDonated: state.player.totalDonated + amount,
            stats: {
              ...state.player.stats,
              reputation: clamp(state.player.stats.reputation + Math.floor(amount / 10000), 0, 100),
              happiness: clamp(state.player.stats.happiness + Math.min(15, Math.floor(amount / 5000)), 0, 100),
            },
          },
          donations: [...state.donations, donation],
        });

        get().addToast({
          type: 'success',
          title: 'Thank you for Donating!',
          message: `Donated ₹${amount.toLocaleString()} to ${cause}. Reputation increased!`,
        });
        return true;
      },

      attendNetworkingEvent: (eventId) => {
        const state = get();
        const event = NETWORKING_EVENTS.find((e) => e.id === eventId);
        if (!event) return false;

        if (state.player.cash < event.cost) {
          get().addToast({
            type: 'error',
            title: 'Insufficient Cash',
            message: `Attending this event requires ₹${event.cost.toLocaleString()}.`,
          });
          return false;
        }

        if (state.player.stats.reputation < event.reputationRequired) {
          get().addToast({
            type: 'error',
            title: 'Low Reputation',
            message: `Requires ${event.reputationRequired} reputation.`,
          });
          return false;
        }

        // Cumulative probability selection
        const rand = Math.random();
        let cumulative = 0;
        let selectedOutcome = event.outcomes[0];
        for (const outcome of event.outcomes) {
          cumulative += outcome.probability;
          if (rand < cumulative) {
            selectedOutcome = outcome;
            break;
          }
        }

        const effects = selectedOutcome.effects;
        const repGain = event.reputationGain + (effects.reputation || 0);
        const cashEffect = effects.cash || 0;
        const happinessEffect = effects.happiness || 0;

        const updatedCash = state.player.cash - event.cost + cashEffect;
        const updatedReputation = clamp(state.player.stats.reputation + repGain, 0, 100);
        const updatedHappiness = clamp(state.player.stats.happiness + happinessEffect, 0, 100);

        set({
          player: {
            ...state.player,
            cash: updatedCash,
            stats: {
              ...state.player.stats,
              reputation: updatedReputation,
              happiness: updatedHappiness,
            },
          },
        });

        get().addToast({
          type: effects.happiness && effects.happiness < 0 ? 'info' : 'success',
          title: `Networking: ${selectedOutcome.label}`,
          message: `Paid ₹${event.cost.toLocaleString()} to attend. Gain: +${repGain} Rep${cashEffect !== 0 ? `, Cash: ₹${cashEffect.toLocaleString()}` : ''}.`,
        });

        return true;
      },

      startDating: () => {
        const state = get();
        if (state.family.relationshipStatus !== 'single') return;

        const newFamilyState = startDating(state.family);

        set({
          family: newFamilyState,
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              happiness: clamp(state.player.stats.happiness + 15, 0, 100),
            },
          },
        });

        get().addToast({
          type: 'success',
          title: 'Started Dating! ❤️',
          message: `You are now dating ${newFamilyState.partnerName}.`,
        });
      },

      getMarried: (weddingTier, hasPrenup) => {
        const state = get();
        if (state.family.relationshipStatus !== 'dating') return false;

        const { family: newFamily, cost } = getMarried(state.family, weddingTier, hasPrenup);
        if (state.player.cash < cost) {
          get().addToast({
            type: 'error',
            title: 'Insufficient Funds',
            message: `Wedding cost: ₹${cost.toLocaleString()}. You need more cash.`,
          });
          return false;
        }

        set({
          player: {
            ...state.player,
            cash: state.player.cash - cost,
            stats: {
              ...state.player.stats,
              happiness: clamp(state.player.stats.happiness + 25, 0, 100),
            },
          },
          family: newFamily,
        });

        get().addToast({
          type: 'success',
          title: 'Just Married! 💍🎉',
          message: `Married ${newFamily.partnerName}! Wedding tier: ${weddingTier}.`,
        });
        return true;
      },

      haveKid: () => {
        const state = get();
        if (state.family.relationshipStatus !== 'married') return false;

        const updatedFamily = haveKid(state.family);
        const newKid = updatedFamily.kids[updatedFamily.kids.length - 1];

        set({
          family: updatedFamily,
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              happiness: clamp(state.player.stats.happiness + 20, 0, 100),
            },
          },
        });

        get().addToast({
          type: 'success',
          title: `It's a baby! 👶🍼`,
          message: `Welcome ${newKid.name} to the family!`,
        });
        return true;
      },

      divorce: () => {
        const state = get();
        if (state.family.relationshipStatus !== 'married') return;

        const { family: newFamily, assetLossPercent } = getDivorce(state.family);
        const cashLoss = Math.round(state.player.cash * assetLossPercent);

        const updatedHoldings = state.market.holdings.map((h) => ({
          ...h,
          shares: Math.round(h.shares * (1 - assetLossPercent)),
          totalInvested: Math.round(h.totalInvested * (1 - assetLossPercent)),
        })).filter((h) => h.shares > 0);

        const updatedCrypto = state.market.cryptoHoldings.map((h) => ({
          ...h,
          units: +(h.units * (1 - assetLossPercent)).toFixed(4),
          totalInvested: Math.round(h.totalInvested * (1 - assetLossPercent)),
        })).filter((h) => h.units > 0);

        set({
          player: {
            ...state.player,
            cash: Math.max(0, state.player.cash - cashLoss),
            stats: {
              ...state.player.stats,
              happiness: clamp(state.player.stats.happiness - 30, 0, 100),
            },
          },
          market: {
            ...state.market,
            holdings: updatedHoldings,
            cryptoHoldings: updatedCrypto,
          },
          family: newFamily,
        });

        get().addToast({
          type: 'error',
          title: 'Divorce Finalized 💔',
          message: `Split assets. Lost ${assetLossPercent * 100}% of funds and investments.`,
        });
      },

      foundStartup: (templateId) => {
        const state = get();
        const template = STARTUP_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return false;

        if (state.startup) return false;

        if (state.player.cash < template.requirements.cash) return false;
        for (const [skill, val] of Object.entries(template.requirements.skills)) {
          if (((state.player.skills as unknown as Record<string, number>)[skill] || 0) < (val || 0)) {
            get().addToast({
              type: 'error',
              title: 'Lacking Skills',
              message: `Need ${skill} level ${val} to found startup.`,
            });
            return false;
          }
        }

        const newStartup = createStartup(template, state.player.name);

        set({
          player: { ...state.player, cash: state.player.cash - template.initialCost },
          startup: newStartup,
        });

        get().addToast({
          type: 'success',
          title: 'Startup Founded! 🚀',
          message: `Launched ${newStartup.name}! Time to build the MVP.`,
        });
        return true;
      },

      raiseStartupFunding: () => {
        const state = get();
        if (!state.startup) return false;
        const startup = state.startup;

        const fundingOffers: Record<string, { amount: number; equity: number }> = {
          idea: { amount: 1500000, equity: 15 },
          mvp: { amount: 8000000, equity: 20 },
          seed: { amount: 30000000, equity: 22 },
          series_a: { amount: 120000000, equity: 25 },
          series_b: { amount: 500000000, equity: 20 },
        };

        const offer = fundingOffers[startup.stage];
        if (!offer) return false;

        const updated = raiseFunding(startup, offer.amount, offer.equity);

        set({
          startup: updated,
        });

        get().addToast({
          type: 'success',
          title: 'Funding Raised! 💰',
          message: `Raised ₹${(offer.amount / 100000).toFixed(1)}L for ${offer.equity}% equity.`,
        });
        return true;
      },

      hireEmployee: () => {
        const state = get();
        if (!state.startup) return false;
        const startup = state.startup;

        const costToHire = 50000;
        if (state.player.cash < costToHire) return false;

        set({
          player: { ...state.player, cash: state.player.cash - costToHire },
          startup: {
            ...startup,
            employees: startup.employees + 1,
            productQuality: Math.min(100, startup.productQuality + 5),
          },
        });

        get().addToast({
          type: 'info',
          title: 'Employee Hired',
          message: `New head count: ${startup.employees + 1}. Product development speed increased.`,
        });
        return true;
      },

      fireEmployee: () => {
        const state = get();
        if (!state.startup || state.startup.employees <= 1) return false;
        const startup = state.startup;

        set({
          startup: {
            ...startup,
            employees: startup.employees - 1,
          },
        });

        get().addToast({
          type: 'info',
          title: 'Employee Laid Off',
          message: `Head count reduced to ${startup.employees - 1}. Monthly burn lowered.`,
        });
        return true;
      },

      improveProduct: () => {
        const state = get();
        if (!state.startup) return false;
        const startup = state.startup;
        const cost = 100000;
        if (state.player.cash < cost) return false;

        set({
          player: { ...state.player, cash: state.player.cash - cost },
          startup: {
            ...startup,
            productQuality: Math.min(100, startup.productQuality + 15),
          },
        });

        get().addToast({
          type: 'success',
          title: 'Product Improved',
          message: `Invested ₹1L in development. Product quality up!`,
        });
        return true;
      },

      shutDownStartup: () => {
        const state = get();
        if (!state.startup) return;

        set({
          startup: null,
        });

        get().addToast({
          type: 'error',
          title: 'Startup Shutdown',
          message: 'Your startup operations have been ceased.',
        });
      },

      contributePPF: (amount) => {
        const state = get();
        if (state.player.cash < amount) return false;
        const newBalance = state.taxPlanning.ppfBalance + amount;

        set({
          player: { ...state.player, cash: state.player.cash - amount },
          taxPlanning: {
            ...state.taxPlanning,
            ppfBalance: newBalance,
            section80CUsed: Math.min(150000, state.taxPlanning.section80CUsed + amount),
          },
        });

        get().addToast({
          type: 'success',
          title: 'PPF Contribution',
          message: `Deposited ₹${amount.toLocaleString()} into Public Provident Fund.`,
        });
        return true;
      },

      contributeNPS: (amount) => {
        const state = get();
        if (state.player.cash < amount) return false;
        const newBalance = state.taxPlanning.npsBalance + amount;

        set({
          player: { ...state.player, cash: state.player.cash - amount },
          taxPlanning: {
            ...state.taxPlanning,
            npsBalance: newBalance,
          },
        });

        get().addToast({
          type: 'success',
          title: 'NPS Contribution',
          message: `Deposited ₹${amount.toLocaleString()} into National Pension System.`,
        });
        return true;
      },

      setPPFMonthlyContribution: (amount) => {
        set((state) => ({
          taxPlanning: {
            ...state.taxPlanning,
            ppfMonthlyContribution: amount,
          },
        }));
      },

      setNPSMonthlyContribution: (amount) => {
        set((state) => ({
          taxPlanning: {
            ...state.taxPlanning,
            npsMonthlyContribution: amount,
          },
        }));
      },

      openForexPosition: (pairId, type, lotSize, leverage, stopLoss, takeProfit) => {
        const state = get();
        const pair = state.market.forexPairs.find((p) => p.id === pairId);
        if (!pair) return false;

        // Calculate margin: margin = (lotSize * currentRate) / leverage
        const margin = Math.round((lotSize * pair.currentRate) / leverage);
        if (state.player.cash < margin) {
          get().addToast({
            type: 'error',
            title: 'Insufficient Funds',
            message: `You need ₹${margin.toLocaleString()} margin to open this position. You only have ₹${state.player.cash.toLocaleString()}.`,
          });
          return false;
        }

        const newPosition: ForexPosition = {
          id: Math.random().toString(36).substring(2, 9),
          pairId,
          type,
          entryRate: pair.currentRate,
          currentRate: pair.currentRate,
          lotSize,
          leverage,
          margin,
          profitLoss: 0,
          openMonth: state.meta.currentMonth,
          stopLoss,
          takeProfit,
        };

        set({
          player: {
            ...state.player,
            cash: state.player.cash - margin,
          },
          market: {
            ...state.market,
            forexPositions: [...(state.market.forexPositions || []), newPosition],
          },
        });

        get().addToast({
          type: 'success',
          title: 'Forex Position Opened',
          message: `Opened ${type.toUpperCase()} position on ${pairId} at rate ${pair.currentRate} with ${leverage}x leverage.`,
        });

        return true;
      },

      closeForexPosition: (positionId) => {
        const state = get();
        const positions = state.market.forexPositions || [];
        const position = positions.find((pos) => pos.id === positionId);
        if (!position) return false;

        const pnl = calculateForexPnL(position);
        const payout = position.margin + pnl;

        set({
          player: {
            ...state.player,
            cash: state.player.cash + payout,
          },
          market: {
            ...state.market,
            forexPositions: positions.filter((pos) => pos.id !== positionId),
          },
        });

        get().addToast({
          type: pnl >= 0 ? 'success' : 'error',
          title: 'Forex Position Closed',
          message: `Closed position on ${position.pairId}. Total Payout: ₹${payout.toLocaleString()} (PnL: ₹${pnl.toLocaleString()}).`,
        });

        return true;
      },
    }),
    {
      name: 'networth-game-save',
      version: 1,
    }
  )
);
