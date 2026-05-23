'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, CreditCard, Home, Banknote, Shield, TrendingDown, ArrowDownCircle, Check, 
  ChevronDown, ChevronUp, Landmark, Flame, Heart, Percent, HelpCircle, Gift, DollarSign,
  TrendingUp, Award, Activity, ArrowUpRight
} from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import { PROPERTY_TEMPLATES, LIFESTYLE_CHOICES } from '../../engine/gameData';
import { STATUS_ITEMS } from '../../engine/socialStatusData';
import { INSURANCE_POLICIES, calculateAssetPremium } from '../../engine/insuranceSystem';
import { SECTION_80C_LIMIT, SECTION_80D_LIMIT, NPS_ADDITIONAL_LIMIT, calculateOptimalTax } from '../../engine/taxPlanningSystem';
import { formatCurrency, calculateEMI } from '../../lib/utils';
import { calculatePortfolioValue } from '../../engine/marketEngine';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import ProgressBar from '../ui/ProgressBar';
import AnimatedNumber from '../ui/AnimatedNumber';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function FinanceScreen() {
  const player = useGameStore((s) => s.player);
  const market = useGameStore((s) => s.market);
  const businesses = useGameStore((s) => s.businesses);
  const properties = useGameStore((s) => s.properties);
  const loans = useGameStore((s) => s.loans);
  const startup = useGameStore((s) => s.startup);
  const taxPlanning = useGameStore((s) => s.taxPlanning);
  const insurance = useGameStore((s) => s.insurance);
  const donations = useGameStore((s) => s.donations);
  const currentMonth = useGameStore((s) => s.meta.currentMonth);

  const takeLoan = useGameStore((s) => s.takeLoan);
  const payOffLoan = useGameStore((s) => s.payOffLoan);
  const changeHousing = useGameStore((s) => s.changeHousing);
  const toggleLifestyle = useGameStore((s) => s.toggleLifestyle);
  
  const buyInsurance = useGameStore((s) => s.buyInsurance);
  const cancelInsurance = useGameStore((s) => s.cancelInsurance);
  const contributePPF = useGameStore((s) => s.contributePPF);
  const contributeNPS = useGameStore((s) => s.contributeNPS);
  const setPPFMonthlyContribution = useGameStore((s) => s.setPPFMonthlyContribution);
  const setNPSMonthlyContribution = useGameStore((s) => s.setNPSMonthlyContribution);
  const makeDonation = useGameStore((s) => s.makeDonation);

  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'insurance' | 'taxes'>('overview');
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanType, setLoanType] = useState<'personal' | 'business'>('personal');
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanMonths, setLoanMonths] = useState(24);

  // PPF/NPS lumpsum contribution inputs
  const [ppfLumpSum, setPpfLumpSum] = useState('');
  const [npsLumpSum, setNpsLumpSum] = useState('');

  // Donation form state
  const [donationCause, setDonationCause] = useState('Child Education NGO');
  const [donationAmount, setDonationAmount] = useState('10000');

  // Compute portfolio breakdown
  const state = useGameStore.getState();
  const portfolioValue = calculatePortfolioValue(state);

  const stockValue = market.holdings.reduce((sum, h) => {
    const comp = market.companies.find((c) => c.id === holdingId(h.companyId));
    return sum + h.shares * (comp?.currentPrice || 0);
  }, 0);

  const cryptoValue = market.cryptoHoldings.reduce((sum, h) => {
    const asset = market.cryptoAssets.find((c) => c.id === h.cryptoId);
    return sum + h.units * (asset?.currentPrice || 0);
  }, 0);

  const mfValue = market.mutualFundHoldings?.reduce((sum, h) => {
    const fund = market.mutualFunds?.find((f) => f.id === h.fundId);
    return sum + h.units * (fund?.nav || 0);
  }, 0) || 0;

  const commodityValue = market.commodityHoldings?.reduce((sum, h) => {
    const comm = market.commodities?.find((c) => c.id === h.commodityId);
    return sum + h.quantity * (comm?.pricePerUnit || 0);
  }, 0) || 0;

  const forexMarginValue = market.forexPositions?.reduce((sum, p) => {
    return sum + p.margin + p.profitLoss;
  }, 0) || 0;

  function holdingId(id: string) { return id; }

  const totalDebt = loans.reduce((s, l) => s + l.remainingAmount, 0);
  const businessEquity = businesses.reduce((s, b) => s + Math.max(0, (b.monthlyRevenue - b.monthlyExpenses) * 60), 0);
  const propertyValue = properties.filter((p) => p.currentValue > 0).reduce((s, p) => s + p.currentValue, 0);
  const startupEquity = startup ? Math.round(startup.valuation * (startup.equity / 100)) : 0;
  const taxSavingsBalance = taxPlanning.ppfBalance + taxPlanning.npsBalance;
  
  const totalCcDebt = player.creditCards?.reduce((sum, c) => sum + c.used, 0) || 0;

  const currentHome = properties.find((p) => p.isPlayerHome);
  const currentHomeTemplate = currentHome ? PROPERTY_TEMPLATES.find((t) => t.id === currentHome.templateId) : null;

  // HRA and insurance-related tax calculations
  let hra = 0;
  if (currentHomeTemplate && currentHomeTemplate.type === 'rental') {
    hra = Math.round(currentHomeTemplate.monthlyRent * 12 * 0.40);
  }

  const activeHealth = insurance.find((ins) => {
    const p = INSURANCE_POLICIES.find((po) => po.id === ins.policyId);
    return p && p.type === 'health';
  });
  const healthPolicy = activeHealth ? INSURANCE_POLICIES.find((p) => p.id === activeHealth.policyId) : null;
  const section80D = healthPolicy ? healthPolicy.monthlyPremium * 12 : 0;

  const donations80G = donations
    .filter((d) => currentMonth - d.month <= 12)
    .reduce((sum, d) => sum + d.amount, 0);

  const annualIncome = player.monthlyIncome * 12;
  const taxOpt = calculateOptimalTax(annualIncome, {
    section80C: taxPlanning.section80CUsed,
    section80D: Math.min(section80D, SECTION_80D_LIMIT),
    nps: taxPlanning.npsMonthlyContribution * 12,
    hra,
    donations80G,
  });

  const baseRates: Record<string, number> = {
    personal: 0.12,
    business: 0.14,
  };
  const creditBonus = (player.creditScore - 500) * 0.0001;
  const activeRate = Math.max(0.05, (baseRates[loanType] || 0.12) - creditBonus);

  // Asset values for premium calculations
  const insuredProperty = properties.find((p) => !p.isPlayerHome) || properties[0];
  const propertyVal = insuredProperty ? insuredProperty.currentValue : 5000000;
  const customPropertyPremium = calculateAssetPremium(propertyVal, 0.005);

  const ownedVehicles = player.ownedStatusItems.filter(id => {
    const item = STATUS_ITEMS.find(s => s.id === id);
    return item && item.category === 'vehicle';
  });
  const vehicleVal = ownedVehicles.length > 0 
    ? STATUS_ITEMS.find((s) => s.id === ownedVehicles[0])?.cost || 1000000
    : 1000000;
  const customVehiclePremium = calculateAssetPremium(vehicleVal, 0.02);

  const isEligibleForLoan = (totalDebt + loanAmount) / (player.monthlyIncome * 12 || 1) <= 0.5;

  return (
    <motion.div className="page-container pb-20" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-4">
        <h1 className="font-heading text-2xl font-extrabold text-gray-100">Finance Dashboard</h1>
        <p className="text-xs text-gray-400">Assets, Liabilities, Insurance, and Taxes</p>
      </motion.div>

      {/* Tabs Menu */}
      <motion.div variants={fadeUp} className="flex border-b border-white/[0.06] mb-4 gap-4 overflow-x-auto no-scrollbar">
        {['Overview', 'Loans', 'Insurance', 'Taxes & Donations'].map((tabLabel, idx) => {
          const tabKeys: ('overview' | 'loans' | 'insurance' | 'taxes')[] = ['overview', 'loans', 'insurance', 'taxes'];
          const tabKey = tabKeys[idx];
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW SUBTAB */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Net Worth Formula Breakdown */}
            <GlassCard hover={false} padding="md" glowColor="cyan">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Balance Sheet Breakdown</p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-white/[0.04] pb-1">
                  <span>ASSETS (+)</span>
                  <span>{formatCurrency(player.cash + portfolioValue + propertyValue + businessEquity + startupEquity + taxSavingsBalance)}</span>
                </div>
                <div className="pl-3 space-y-1.5 text-gray-400">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Wallet className="w-3 h-3 text-emerald-400" /> Cash (Liquid)</span>
                    <span>{formatCurrency(player.cash)}</span>
                  </div>
                  {stockValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span>• Stocks Portfolio</span>
                      <span>{formatCurrency(stockValue)}</span>
                    </div>
                  )}
                  {cryptoValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span>• Crypto Holdings</span>
                      <span>{formatCurrency(cryptoValue)}</span>
                    </div>
                  )}
                  {mfValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span>• Mutual Funds (SIPs)</span>
                      <span>{formatCurrency(mfValue)}</span>
                    </div>
                  )}
                  {commodityValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span>• Precious Metals / SGBs</span>
                      <span>{formatCurrency(commodityValue)}</span>
                    </div>
                  )}
                  {forexMarginValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span>• Forex Positions Margin</span>
                      <span>{formatCurrency(forexMarginValue)}</span>
                    </div>
                  )}
                  {propertyValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Home className="w-3 h-3 text-purple-400" /> Real Estate Assets</span>
                      <span>{formatCurrency(propertyValue)}</span>
                    </div>
                  )}
                  {businessEquity > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Banknote className="w-3 h-3 text-cyan-400" /> Business Equity</span>
                      <span>{formatCurrency(businessEquity)}</span>
                    </div>
                  )}
                  {startupEquity > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3 text-indigo-400" /> Startup Valuation ({startup?.equity}% Share)</span>
                      <span>{formatCurrency(startupEquity)}</span>
                    </div>
                  )}
                  {taxSavingsBalance > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3 text-amber-400" /> PPF & NPS Retirement Funds</span>
                      <span>{formatCurrency(taxSavingsBalance)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-red-400 font-bold border-b border-white/[0.04] pt-2 pb-1">
                  <span>LIABILITIES (-)</span>
                  <span>{formatCurrency(totalDebt + totalCcDebt)}</span>
                </div>
                <div className="pl-3 space-y-1.5 text-gray-400">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><ArrowDownCircle className="w-3 h-3 text-red-400" /> Loan Balances</span>
                    <span>{formatCurrency(totalDebt)}</span>
                  </div>
                  {totalCcDebt > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-rose-400" /> Credit Card Dues</span>
                      <span>{formatCurrency(totalCcDebt)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/[0.08] pt-3 flex justify-between items-center text-sm">
                  <span className="text-gray-200 font-bold">Estimated Net Worth</span>
                  <AnimatedNumber value={player.netWorth} format="currency" size="lg" />
                </div>
              </div>
            </GlassCard>

            {/* Credit Score Rating */}
            <GlassCard hover={false} padding="md" glowColor={player.creditScore >= 700 ? 'green' : player.creditScore >= 500 ? 'gold' : 'red'}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${player.creditScore >= 700 ? 'text-emerald-400' : player.creditScore >= 500 ? 'text-yellow-400' : 'text-red-400'}`} />
                  <span className="text-sm font-semibold text-gray-200">Experian Credit Score</span>
                </div>
                <span className="font-mono text-xl font-bold text-gray-100">{player.creditScore} / 900</span>
              </div>
              <ProgressBar
                value={player.creditScore - 300}
                max={600}
                color={player.creditScore >= 700 ? 'green' : player.creditScore >= 500 ? 'gold' : 'red'}
                size="sm"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
                <span>Rating: {player.creditScore >= 750 ? '🌟 Excellent' : player.creditScore >= 700 ? '✅ Good' : player.creditScore >= 600 ? '⚠️ Fair' : '❌ Poor'}</span>
                <span>Affects loan approval interest rates (minimum rate: 5% APR)</span>
              </div>
            </GlassCard>

            {/* Primary Residence */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Housing & Renting</p>
              <div className="grid grid-cols-1 gap-2">
                {PROPERTY_TEMPLATES.filter((p) => p.type === 'rental').map((prop) => {
                  const isCurrent = currentHomeTemplate?.id === prop.id;
                  return (
                    <GlassCard key={prop.id} padding="sm" glowColor={isCurrent ? 'cyan' : 'none'} hover={!isCurrent}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-200">{prop.name}</p>
                          <p className="text-[10px] text-gray-400">
                            Rent: {formatCurrency(prop.monthlyRent)}/mo • Happiness Boost: +{prop.happinessBoost}
                          </p>
                        </div>
                        {isCurrent ? (
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
                        ) : (
                          <GlowButton size="sm" variant="ghost" onClick={() => changeHousing(prop.id)}>Move In</GlowButton>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Lifestyle Choices Checklist */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Lifestyle & Outflows</p>
              <div className="grid grid-cols-2 gap-2">
                {LIFESTYLE_CHOICES.map((choice) => {
                  const isActive = player.activeLifestyle.includes(choice.id);
                  return (
                    <GlassCard
                      key={choice.id}
                      padding="sm"
                      glowColor={isActive ? 'green' : 'none'}
                      onClick={() => toggleLifestyle(choice.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-1 justify-between">
                        <span className="text-xs font-semibold text-gray-200 truncate">{choice.name}</span>
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-white/10" />
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>Cost: {formatCurrency(choice.monthlyCost)}/mo</span>
                        {choice.effects.happiness && (
                          <span className="text-emerald-400">+{choice.effects.happiness} Happy</span>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* LOANS SUBTAB */}
        {activeTab === 'loans' && (
          <motion.div
            key="loans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Outstanding Debt Info */}
            <GlassCard hover={false} padding="md" glowColor={totalDebt > 0 ? 'red' : 'green'}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Outstanding Loan Liability</p>
                  <p className="text-2xl font-mono font-bold text-gray-100 mt-1">{formatCurrency(totalDebt)}</p>
                </div>
                <Landmark className="w-10 h-10 text-red-500/30" />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Your monthly EMI payments are automatically deducted from cash at the beginning of each month. Late payments penalize your Credit Score.
              </p>
            </GlassCard>

            {/* Active Loans */}
            {loans.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Your Active Credit Lines</p>
                {loans.map((loan) => (
                  <GlassCard key={loan.id} hover={false} padding="sm" glowColor="red">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-200">{loan.description}</p>
                        <p className="text-[10px] text-gray-400">
                          EMI: {formatCurrency(loan.monthlyEMI)}/mo • Rate: {(loan.interestRate * 100).toFixed(1)}% APR
                        </p>
                      </div>
                      <GlowButton
                        size="sm"
                        variant="primary"
                        onClick={() => payOffLoan(loan.id)}
                        disabled={player.cash < loan.remainingAmount}
                      >
                        Pay Off Early
                      </GlowButton>
                    </div>
                    <ProgressBar
                      value={loan.monthsPaid}
                      max={loan.totalMonths}
                      label={`Principal Outstanding: ${formatCurrency(loan.remainingAmount)}`}
                      sublabel={`${loan.monthsPaid} / ${loan.totalMonths} EMIs Cleared`}
                      showPercent
                      color="red"
                      size="sm"
                    />
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard hover={false} padding="sm" className="text-center py-6 text-gray-500 text-xs">
                No active loans. You have a clean debt sheet!
              </GlassCard>
            )}

            {/* Loan Borrow Form Toggle */}
            <div>
              <GlowButton
                variant="ghost"
                fullWidth
                onClick={() => setShowLoanForm(!showLoanForm)}
                icon={showLoanForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              >
                {showLoanForm ? 'Cancel Application' : 'Apply For A New Credit Facility'}
              </GlowButton>

              {showLoanForm && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <GlassCard hover={false} padding="md" glowColor="gold">
                    <div className="flex items-center gap-2 mb-4">
                      <Landmark className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-100">National Credit Approval System</span>
                    </div>

                    <div className="space-y-4">
                      {/* Loan Type Selector */}
                      <div className="grid grid-cols-2 gap-2">
                        {['personal', 'business'].map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setLoanType(t as 'personal' | 'business');
                              if (t === 'business') {
                                setLoanAmount(Math.max(500000, loanAmount));
                              }
                            }}
                            className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              loanType === t
                                ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            {t.toUpperCase()} LOAN
                          </button>
                        ))}
                      </div>

                      {/* Sliders */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Desired Loan Capital</span>
                          <span className="font-bold text-gray-100 font-mono">{formatCurrency(loanAmount)}</span>
                        </div>
                        <input
                          type="range"
                          min={loanType === 'business' ? 500000 : 50000}
                          max={loanType === 'business' ? 10000000 : 2000000}
                          step={50000}
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full accent-amber-400"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                          <span>Min: {formatCurrency(loanType === 'business' ? 500000 : 50000)}</span>
                          <span>Max: {formatCurrency(loanType === 'business' ? 10000000 : 2000000)}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Amortization Tenure</span>
                          <span className="font-bold text-gray-100 font-mono">{loanMonths} Months</span>
                        </div>
                        <input
                          type="range"
                          min={6}
                          max={60}
                          step={6}
                          value={loanMonths}
                          onChange={(e) => setLoanMonths(Number(e.target.value))}
                          className="w-full accent-amber-400"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                          <span>Min: 6 Months</span>
                          <span>Max: 60 Months</span>
                        </div>
                      </div>

                      {/* Terms Sheet Card */}
                      <div className="bg-white/[0.03] rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Applied Annual Rate:</span>
                          <span className="font-mono text-emerald-400 font-bold">{(activeRate * 100).toFixed(2)}% APR</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Estimated Monthly Payment (EMI):</span>
                          <span className="font-mono text-gray-100 font-bold">{formatCurrency(calculateEMI(loanAmount, activeRate, loanMonths))}/mo</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 border-t border-white/5 pt-1.5">
                          <span>Debt-to-Income Margin:</span>
                          <span className={`font-mono font-bold ${isEligibleForLoan ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(((totalDebt + loanAmount) / (player.monthlyIncome * 12 || 1)) * 100).toFixed(1)}% / 50%
                          </span>
                        </div>
                      </div>

                      {!isEligibleForLoan && (
                        <p className="text-[10px] text-rose-400 text-center font-semibold">
                          ⚠️ Application Rejected: Your proposed debt exceeds 50% of your annual income projection.
                        </p>
                      )}

                      <GlowButton
                        variant="primary"
                        fullWidth
                        disabled={!isEligibleForLoan}
                        onClick={() => {
                          const success = takeLoan(loanType, loanAmount, loanMonths);
                          if (success) {
                            setShowLoanForm(false);
                          }
                        }}
                      >
                        Submit Capital Request
                      </GlowButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* INSURANCE SUBTAB */}
        {activeTab === 'insurance' && (
          <motion.div
            key="insurance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Active Insurance Claims & Status */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Active Protection Plans</p>
              {insurance.length > 0 ? (
                <div className="space-y-2">
                  {insurance.map((ins) => {
                    const policy = INSURANCE_POLICIES.find((p) => p.id === ins.policyId);
                    if (!policy) return null;

                    let monthlyPremium = policy.monthlyPremium;
                    if (policy.type === 'property') {
                      monthlyPremium = customPropertyPremium;
                    } else if (policy.type === 'vehicle') {
                      monthlyPremium = customVehiclePremium;
                    }

                    return (
                      <GlassCard key={ins.policyId} hover={false} padding="sm" glowColor="green">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> {policy.name}
                          </span>
                          <span className="font-mono text-xs font-semibold text-gray-300">{formatCurrency(monthlyPremium)}/mo</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-2">{policy.description}</p>
                        <div className="flex justify-between text-[9px] text-gray-500 border-t border-white/[0.04] pt-1.5">
                          <span>Claims: {ins.claimsCount} Filed</span>
                          <span>Reimbursed: {formatCurrency(ins.totalClaimedAmount)}</span>
                          <button
                            onClick={() => cancelInsurance(policy.id)}
                            className="text-rose-400 font-semibold hover:underline"
                          >
                            Cancel Coverage
                          </button>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              ) : (
                <GlassCard hover={false} padding="sm" className="text-center py-6 text-gray-500 text-xs">
                  Your life and assets are currently uninsured. Any health or accident events will require full out-of-pocket payments!
                </GlassCard>
              )}
            </div>

            {/* Insurance Catalog */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Protection Marketplace</p>
              <div className="space-y-2.5">
                {INSURANCE_POLICIES.map((policy) => {
                  const isActive = insurance.some((ins) => ins.policyId === policy.id);
                  
                  // Calculate dynamic premium displays
                  let displayPremium = policy.monthlyPremium;
                  let detailsStr = '';
                  if (policy.type === 'property') {
                    displayPremium = customPropertyPremium;
                    detailsStr = `(0.5% of ${formatCurrency(propertyVal)} Property Value)`;
                  } else if (policy.type === 'vehicle') {
                    displayPremium = customVehiclePremium;
                    detailsStr = `(2.0% of ${formatCurrency(vehicleVal)} Vehicle Cost)`;
                  }

                  return (
                    <GlassCard key={policy.id} hover={!isActive} padding="sm" glowColor={isActive ? 'none' : 'cyan'}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-xs font-bold text-gray-200">{policy.name}</p>
                          <p className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider">{policy.type} Insurance</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs font-bold text-gray-100">{formatCurrency(displayPremium)}/mo</p>
                          {detailsStr && <p className="text-[8px] text-gray-500">{detailsStr}</p>}
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-gray-400 mb-2 mt-1">{policy.description}</p>
                      
                      <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/[0.04] pt-2">
                        <span>Max Coverage: {formatCurrency(policy.coverageAmount || propertyVal)}</span>
                        <span>Co-pay Rate: {Math.round(policy.coveragePercent * 100)}%</span>
                        {isActive ? (
                          <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">ACTIVE COVERAGE</span>
                        ) : (
                          <GlowButton
                            size="sm"
                            variant="primary"
                            disabled={player.cash < displayPremium}
                            onClick={() => buyInsurance(policy.id)}
                          >
                            Buy Policy
                          </GlowButton>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAXES & DONATIONS SUBTAB */}
        {activeTab === 'taxes' && (
          <motion.div
            key="taxes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Regime Optimizer Banner */}
            <GlassCard hover={false} padding="md" glowColor={taxOpt.recommendOld ? 'gold' : 'green'}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Indian Income Tax Optimizer (FY 2024-25)</p>
                  <p className="text-sm font-bold text-gray-200 mt-1">
                    Recommendation: <span className="text-emerald-400 font-bold font-mono">{taxOpt.recommendOld ? 'OLD TAX REGIME' : 'NEW TAX REGIME'}</span>
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 text-center font-mono">
                  <p className="text-[9px] text-emerald-400 uppercase font-semibold">Taxes Saved</p>
                  <p className="text-xs font-bold text-emerald-400">{formatCurrency(taxOpt.savings)}/yr</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 font-mono text-[10px] text-gray-400">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500">NEW REGIME (NO DEDUCTIONS)</p>
                  <p className="text-xs font-semibold text-gray-300 mt-0.5">{formatCurrency(taxOpt.newRegimeTax)} / year</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-gray-500">OLD REGIME (WITH DEDUCTIONS)</p>
                  <p className="text-xs font-semibold text-gray-300 mt-0.5">{formatCurrency(taxOpt.oldRegimeTax)} / year</p>
                </div>
              </div>
            </GlassCard>

            {/* Deductions Breakdown */}
            <GlassCard hover={false} padding="sm">
              <p className="text-xs font-bold text-gray-300 mb-2 border-b border-white/[0.04] pb-1">Tax Deductions Applied (Old Regime)</p>
              <div className="space-y-2 text-[10px] font-mono text-gray-400">
                <div className="flex justify-between items-center">
                  <span>Sec 80C (PPF, ELSS Mutual Funds)</span>
                  <span>{formatCurrency(taxPlanning.section80CUsed)} / {formatCurrency(SECTION_80C_LIMIT)} limit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sec 80D (Health Insurance Premiums)</span>
                  <span>{formatCurrency(section80D)} / {formatCurrency(SECTION_80D_LIMIT)} limit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sec 80CCD (National Pension System)</span>
                  <span>{formatCurrency(taxPlanning.npsMonthlyContribution * 12)} / {formatCurrency(NPS_ADDITIONAL_LIMIT)} limit</span>
                </div>
                {hra > 0 && (
                  <div className="flex justify-between items-center">
                    <span>House Rent Allowance (HRA Exemption)</span>
                    <span>{formatCurrency(hra)}</span>
                  </div>
                )}
                {donations80G > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Sec 80G (Charity Exemption - 50%)</span>
                    <span>{formatCurrency(donations80G * 0.50)} (Gross: {formatCurrency(donations80G)})</span>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* PPF Sliders & NPS Sliders */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Retirement Funds Planning</p>
              
              {/* PPF */}
              <GlassCard hover={false} padding="sm" glowColor="cyan">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-gray-200">Public Provident Fund (PPF)</p>
                    <p className="text-[9px] text-gray-400">Current Balance: <span className="font-mono text-gray-200 font-semibold">{formatCurrency(taxPlanning.ppfBalance)}</span> • Yield: 7.1% (Safe)</p>
                  </div>
                  <Landmark className="w-5 h-5 text-cyan-400/50" />
                </div>
                <div className="space-y-2 mt-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Monthly Contribution (Auto-Saves Tax)</span>
                      <span className="font-mono font-bold text-cyan-300">{formatCurrency(taxPlanning.ppfMonthlyContribution)}/mo</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12500}
                      step={500}
                      value={taxPlanning.ppfMonthlyContribution}
                      onChange={(e) => setPPFMonthlyContribution(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  
                  {/* PPF Lumpsum */}
                  <div className="flex gap-2 items-center border-t border-white/[0.04] pt-2 mt-2">
                    <input
                      type="number"
                      placeholder="Lump Sum Amount..."
                      value={ppfLumpSum}
                      onChange={(e) => setPpfLumpSum(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-200 w-full focus:outline-none focus:border-cyan-400/50"
                    />
                    <GlowButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const amount = Number(ppfLumpSum);
                        if (amount > 0 && contributePPF(amount)) {
                          setPpfLumpSum('');
                        }
                      }}
                    >
                      Deposit
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>

              {/* NPS */}
              <GlassCard hover={false} padding="sm" glowColor="gold">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-gray-200">National Pension System (NPS)</p>
                    <p className="text-[9px] text-gray-400">Current Balance: <span className="font-mono text-gray-200 font-semibold">{formatCurrency(taxPlanning.npsBalance)}</span> • Expected Return: ~10% (Market)</p>
                  </div>
                  <Landmark className="w-5 h-5 text-yellow-400/50" />
                </div>
                <div className="space-y-2 mt-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Monthly Contribution (Auto-Saves Tax)</span>
                      <span className="font-mono font-bold text-yellow-300">{formatCurrency(taxPlanning.npsMonthlyContribution)}/mo</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15000}
                      step={500}
                      value={taxPlanning.npsMonthlyContribution}
                      onChange={(e) => setNPSMonthlyContribution(Number(e.target.value))}
                      className="w-full accent-yellow-400"
                    />
                  </div>
                  
                  {/* NPS Lumpsum */}
                  <div className="flex gap-2 items-center border-t border-white/[0.04] pt-2 mt-2">
                    <input
                      type="number"
                      placeholder="Lump Sum Amount..."
                      value={npsLumpSum}
                      onChange={(e) => setNpsLumpSum(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-200 w-full focus:outline-none focus:border-yellow-400/50"
                    />
                    <GlowButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const amount = Number(npsLumpSum);
                        if (amount > 0 && contributeNPS(amount)) {
                          setNpsLumpSum('');
                        }
                      }}
                    >
                      Deposit
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Donation Section */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Charitable Donations (Section 80G)</p>
              <GlassCard hover={false} padding="md" glowColor="green">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">80G Philanthropy Panel</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Select Charitable Cause</label>
                    <select
                      value={donationCause}
                      onChange={(e) => setDonationCause(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-gray-200 w-full focus:outline-none"
                    >
                      <option className="bg-neutral-900" value="Disaster Relief Fund">Disaster Relief Fund (50% Exemption)</option>
                      <option className="bg-neutral-900" value="Rural Healthcare Mission">Rural Healthcare Mission (50% Exemption)</option>
                      <option className="bg-neutral-900" value="National AI Research Lab">National AI Research Lab (50% Exemption)</option>
                      <option className="bg-neutral-900" value="Underprivileged Kids Schooling">Underprivileged Kids Schooling (50% Exemption)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Donation Capital (Cash outflow)</label>
                    <select
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-gray-200 w-full focus:outline-none"
                    >
                      <option className="bg-neutral-900" value="5000">₹5,000 (Saves ₹750 Tax, +1 Reputation)</option>
                      <option className="bg-neutral-900" value="10000">₹10,000 (Saves ₹1,500 Tax, +2 Reputation)</option>
                      <option className="bg-neutral-900" value="50000">₹50,000 (Saves ₹7,500 Tax, +5 Reputation)</option>
                      <option className="bg-neutral-900" value="100000">₹1,00,000 (Saves ₹15,000 Tax, +10 Reputation)</option>
                    </select>
                  </div>

                  <p className="text-[9px] text-gray-500 leading-normal">
                    Donating will immediately reduce your cash balance, but it increases your Happiness and Reputation stats while lowering your Old Regime Tax burden under Section 80G.
                  </p>

                  <GlowButton
                    variant="primary"
                    fullWidth
                    disabled={player.cash < Number(donationAmount)}
                    onClick={() => {
                      makeDonation(donationCause, Number(donationAmount));
                    }}
                  >
                    Commit Philanthropic Payout
                  </GlowButton>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
