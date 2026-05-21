'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  TrendingUp, 
  ArrowUpCircle, 
  Trash2, 
  Lock, 
  Home, 
  Building, 
  Landmark, 
  Rocket, 
  Users, 
  Wrench, 
  Coins, 
  Briefcase, 
  Plus, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import { BUSINESS_TEMPLATES, PROPERTY_TEMPLATES } from '../../engine/gameData';
import { STARTUP_TEMPLATES, canAdvanceStage } from '../../engine/startupSystem';
import { formatCurrency } from '../../lib/utils';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import ProgressBar from '../ui/ProgressBar';
import { SkillType } from '../../engine/types';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function BusinessScreen() {
  const player = useGameStore((s) => s.player);
  const businesses = useGameStore((s) => s.businesses);
  const properties = useGameStore((s) => s.properties);
  const loans = useGameStore((s) => s.loans);
  const startup = useGameStore((s) => s.startup);
  const activeSubTab = useGameStore((s) => s.ui.activeSubTab);
  const setSubTab = useGameStore((s) => s.setSubTab);

  // Store actions
  const startBusiness = useGameStore((s) => s.startBusiness);
  const upgradeBusiness = useGameStore((s) => s.upgradeBusiness);
  const sellBusiness = useGameStore((s) => s.sellBusiness);

  const foundStartup = useGameStore((s) => s.foundStartup);
  const raiseStartupFunding = useGameStore((s) => s.raiseStartupFunding);
  const hireEmployee = useGameStore((s) => s.hireEmployee);
  const fireEmployee = useGameStore((s) => s.fireEmployee);
  const improveProduct = useGameStore((s) => s.improveProduct);
  const shutDownStartup = useGameStore((s) => s.shutDownStartup);

  const changeHousing = useGameStore((s) => s.changeHousing);
  const buyProperty = useGameStore((s) => s.buyProperty);
  const sellProperty = useGameStore((s) => s.sellProperty);

  const currentSubTab = ['businesses', 'startups', 'properties'].includes(activeSubTab) ? activeSubTab : 'businesses';

  // Requirements check for businesses
  const canStartBiz = (templateId: string) => {
    const t = BUSINESS_TEMPLATES.find((b) => b.id === templateId);
    if (!t) return false;
    if (player.cash < t.startupCost) return false;
    if (t.requirements.reputation && player.stats.reputation < t.requirements.reputation) return false;
    if (t.requirements.skills) {
      for (const [skill, level] of Object.entries(t.requirements.skills)) {
        if ((player.skills[skill as SkillType] || 0) < (level || 0)) return false;
      }
    }
    return true;
  };

  // Requirements check for startups
  const canFoundStartup = (templateId: string) => {
    const template = STARTUP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return false;
    if (player.cash < template.requirements.cash) return false;
    for (const [skill, val] of Object.entries(template.requirements.skills)) {
      if ((player.skills[skill as SkillType] || 0) < (val || 0)) {
        return false;
      }
    }
    return true;
  };

  // Funding offer details helper
  const getFundingOffer = (stage: string) => {
    const offers: Record<string, { amount: number; equity: number }> = {
      idea: { amount: 1500000, equity: 15 },
      mvp: { amount: 8000000, equity: 20 },
      seed: { amount: 30000000, equity: 22 },
      series_a: { amount: 120000000, equity: 25 },
      series_b: { amount: 500000000, equity: 20 },
    };
    return offers[stage];
  };

  // Next stage requirements helper
  const getNextStageReqs = (stage: string) => {
    const reqs: Record<string, { next: string; months: number; fit: number; rev: number }> = {
      idea: { next: 'MVP', months: 3, fit: 0, rev: 0 },
      mvp: { next: 'Seed', months: 6, fit: 20, rev: 10000 },
      seed: { next: 'Series A', months: 12, fit: 40, rev: 100000 },
      series_a: { next: 'Series B', months: 18, fit: 60, rev: 500000 },
      series_b: { next: 'IPO', months: 24, fit: 80, rev: 2000000 },
    };
    return reqs[stage];
  };

  return (
    <motion.div className="page-container pb-24" variants={stagger} initial="hidden" animate="show">
      {/* Tab Selector */}
      <motion.div variants={fadeUp} className="flex gap-2 p-1 bg-white/[0.02] border border-white/[0.05] rounded-xl mb-5">
        <button
          onClick={() => setSubTab('businesses')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            currentSubTab === 'businesses'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          🏢 Businesses
        </button>
        <button
          onClick={() => setSubTab('startups')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            currentSubTab === 'startups'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          🚀 Startups
        </button>
        <button
          onClick={() => setSubTab('properties')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            currentSubTab === 'properties'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          🏡 Real Estate
        </button>
      </motion.div>

      {/* SUBTAB CONTENT: BUSINESSES */}
      {currentSubTab === 'businesses' && (
        <>
          <motion.div variants={fadeUp} className="mb-4">
            <h1 className="font-heading text-xl font-bold text-gray-200">Business Empire</h1>
            <p className="text-xs text-gray-500">Acquire and upgrade brick-and-mortar passive cash generators</p>
          </motion.div>

          {/* Your Businesses */}
          {businesses.length > 0 && (
            <>
              <motion.div variants={fadeUp}>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 px-1">Your Portfolio</p>
              </motion.div>
              <div className="space-y-3 mb-5">
                {businesses.map((biz) => {
                  const template = BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId);
                  const profit = biz.monthlyRevenue - biz.monthlyExpenses;
                  const availableUpgrades = template?.upgrades.filter((u) => !biz.purchasedUpgrades.includes(u.id)) || [];

                  return (
                    <motion.div key={biz.id} variants={fadeUp}>
                      <GlassCard hover={false} glowColor={profit >= 0 ? 'green' : 'red'} padding="md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profit >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                              <Building2 className={`w-5 h-5 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-200">{biz.name}</p>
                              <p className="text-xs text-gray-500">Level {biz.level} • {biz.monthsOwned}mo old</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {profit >= 0 ? '+' : ''}{formatCurrency(profit)}/mo
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                          <div className="bg-white/[0.02] rounded-lg p-1.5 border border-white/[0.04]">
                            <p className="text-[9px] text-gray-500">Revenue</p>
                            <p className="text-xs font-mono text-emerald-400">{formatCurrency(biz.monthlyRevenue)}</p>
                          </div>
                          <div className="bg-white/[0.02] rounded-lg p-1.5 border border-white/[0.04]">
                            <p className="text-[9px] text-gray-500">Expenses</p>
                            <p className="text-xs font-mono text-red-400">{formatCurrency(biz.monthlyExpenses)}</p>
                          </div>
                          <div className="bg-white/[0.02] rounded-lg p-1.5 border border-white/[0.04]">
                            <p className="text-[9px] text-gray-500">Total Profit</p>
                            <p className="text-xs font-mono text-gray-300">{formatCurrency(biz.totalProfit)}</p>
                          </div>
                        </div>

                        <ProgressBar value={biz.health} label="Business Health" showPercent color={biz.health > 50 ? 'green' : biz.health > 20 ? 'gold' : 'red'} size="sm" className="mb-3" />

                        {availableUpgrades.length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase px-1">Available Upgrades</p>
                            {availableUpgrades.map((upgrade) => (
                              <div key={upgrade.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg p-2">
                                <div>
                                  <p className="text-xs font-semibold text-gray-300">{upgrade.name}</p>
                                  <p className="text-[10px] text-gray-500">{formatCurrency(upgrade.cost)} • +{Math.round((upgrade.revenueBoost - 1) * 100)}% revenue</p>
                                </div>
                                <GlowButton
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => upgradeBusiness(biz.id, upgrade.id)}
                                  disabled={player.cash < upgrade.cost}
                                  icon={<ArrowUpCircle className="w-3 h-3" />}
                                >
                                  Buy
                                </GlowButton>
                              </div>
                            ))}
                          </div>
                        )}

                        <GlowButton variant="ghost" size="sm" fullWidth onClick={() => sellBusiness(biz.id)} icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}>
                          <span className="text-red-400 text-xs">Sell Business (95% Value)</span>
                        </GlowButton>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* Business Marketplace */}
          <motion.div variants={fadeUp}>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 px-1">Marketplace</p>
          </motion.div>
          <div className="space-y-4">
            {(['solo', 'small', 'major'] as const).map((tier) => (
              <div key={tier} className="space-y-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">
                  {tier === 'solo' ? '🟢 Solo Hustles' : tier === 'small' ? '🔵 Small Business Franchises' : '🏢 Major Conglomerates'}
                </p>
                <div className="space-y-2">
                  {BUSINESS_TEMPLATES.filter((b) => b.tier === tier).map((template) => {
                    const available = canStartBiz(template.id);
                    const alreadyOwned = businesses.some((b) => b.templateId === template.id);
                    const monthlyProfit = template.monthlyRevenue - template.monthlyExpenses;
                    const roi = Math.round(((monthlyProfit * 12) / template.startupCost) * 100);

                    return (
                      <GlassCard key={template.id} padding="sm" glowColor={available ? 'green' : 'none'} hover={available}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-gray-200">{template.name}</p>
                              {alreadyOwned && <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold">Owned</span>}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] font-mono text-gray-500">
                              <span>Cost: <span className="text-emerald-400 font-bold">{formatCurrency(template.startupCost)}</span></span>
                              <span>Est. Profit: <span className="text-emerald-400">+{formatCurrency(monthlyProfit)}/mo</span></span>
                              <span>ROI: <span className="text-blue-400">{roi}%</span></span>
                            </div>
                            {template.requirements.skills && Object.keys(template.requirements.skills).length > 0 && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-yellow-500/80">
                                <Lock className="w-3 h-3" />
                                <span>Req: {Object.entries(template.requirements.skills).map(([s, l]) => `${s} Lvl ${l}`).join(', ')}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {!alreadyOwned && (
                              <GlowButton
                                size="sm"
                                variant={available ? 'primary' : 'ghost'}
                                onClick={() => startBusiness(template.id)}
                                disabled={!available}
                              >
                                Start
                              </GlowButton>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SUBTAB CONTENT: STARTUPS */}
      {currentSubTab === 'startups' && (
        <>
          <motion.div variants={fadeUp} className="mb-4">
            <h1 className="font-heading text-xl font-bold text-gray-200">Venture Startups</h1>
            <p className="text-xs text-gray-500">Found hyper-scalable, high-risk VC backed companies</p>
          </motion.div>

          {/* ACTIVE STARTUP DISPLAY */}
          {startup ? (
            <motion.div variants={fadeUp} className="space-y-4">
              <GlassCard hover={false} glowColor="cyan" padding="md">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/[0.06] pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <h2 className="text-base font-bold text-gray-100">{startup.name}</h2>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Sector: <span className="text-gray-300 font-semibold uppercase">{startup.sector}</span> • Age: {startup.monthsRunning} months
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    {startup.stage} Stage
                  </span>
                </div>

                {/* Valuation Display */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Valuation</p>
                    <p className="text-lg font-heading font-bold text-cyan-400 mt-0.5">{formatCurrency(startup.valuation)}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Your Equity ({startup.equity}%)</p>
                    <p className="text-lg font-heading font-bold text-emerald-400 mt-0.5">
                      {formatCurrency(Math.round(startup.valuation * (startup.equity / 100)))}
                    </p>
                  </div>
                </div>

                {/* Financial Health Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-white/[0.01] rounded-lg p-2 border border-white/[0.03]">
                    <p className="text-[9px] text-gray-500">Revenue</p>
                    <p className="text-xs font-mono text-emerald-400 mt-0.5">{formatCurrency(startup.revenue)}/mo</p>
                  </div>
                  <div className="bg-white/[0.01] rounded-lg p-2 border border-white/[0.03]">
                    <p className="text-[9px] text-gray-500">Monthly Burn</p>
                    <p className="text-xs font-mono text-red-400 mt-0.5">{formatCurrency(startup.monthlyBurn)}/mo</p>
                  </div>
                  <div className="bg-white/[0.01] rounded-lg p-2 border border-white/[0.03]">
                    <p className="text-[9px] text-gray-500">VC Funds Remaining</p>
                    <p className="text-xs font-mono text-gray-300 mt-0.5">{formatCurrency(startup.fundingRaised)}</p>
                  </div>
                </div>

                {/* Runway and Headcount */}
                <div className="flex justify-between items-center bg-white/[0.01] rounded-xl p-2.5 px-3 border border-white/[0.03] text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Runway: <span className={`font-bold ${startup.runway <= 2 ? 'text-red-400 animate-bounce' : 'text-gray-200'}`}>
                      {startup.runway === 999 ? 'Infinite' : `${startup.runway} months`}
                    </span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Employees: <span className="text-gray-200 font-bold">{startup.employees}</span></span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-3 mb-4">
                  <ProgressBar value={startup.productQuality} label="Product & Quality MVP" showPercent color="cyan" size="sm" />
                  <ProgressBar value={startup.marketFit} label="Product-Market Fit (PMF)" showPercent color="green" size="sm" />
                </div>

                {/* Stage progression requirements indicator */}
                {getNextStageReqs(startup.stage) && (
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 mb-4">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">Requirements for {getNextStageReqs(startup.stage).next} Stage</p>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div className="flex flex-col">
                        <span className="text-gray-500">Age:</span>
                        <span className={`font-mono font-bold ${startup.monthsRunning >= getNextStageReqs(startup.stage).months ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {startup.monthsRunning}/{getNextStageReqs(startup.stage).months} mo
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500">Min PMF:</span>
                        <span className={`font-mono font-bold ${startup.marketFit >= getNextStageReqs(startup.stage).fit ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {startup.marketFit.toFixed(0)}%/{getNextStageReqs(startup.stage).fit}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500">Min Revenue:</span>
                        <span className={`font-mono font-bold ${startup.revenue >= getNextStageReqs(startup.stage).rev ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {formatCurrency(startup.revenue)}/{formatCurrency(getNextStageReqs(startup.stage).rev)}
                        </span>
                      </div>
                    </div>
                    {canAdvanceStage(startup) && (
                      <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Ready to advance next month! (Subject to VC approval probability)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Startup Action Panel */}
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 px-1">Startup Actions</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <GlowButton
                      variant="secondary"
                      size="sm"
                      onClick={improveProduct}
                      disabled={player.cash < 100000}
                      icon={<Wrench className="w-3.5 h-3.5" />}
                    >
                      Improve Product (-₹1L)
                    </GlowButton>
                    <GlowButton
                      variant="secondary"
                      size="sm"
                      onClick={hireEmployee}
                      disabled={player.cash < 50000}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Hire Dev (-₹50K)
                    </GlowButton>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <GlowButton
                      variant="ghost"
                      size="sm"
                      onClick={fireEmployee}
                      disabled={startup.employees <= 1}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Lay Off Dev
                    </GlowButton>
                    
                    {getFundingOffer(startup.stage) ? (
                      <GlowButton
                        variant="primary"
                        size="sm"
                        onClick={raiseStartupFunding}
                        icon={<Coins className="w-3.5 h-3.5" />}
                      >
                        Raise Funds (+₹{(getFundingOffer(startup.stage).amount / 100000).toFixed(1)}L)
                      </GlowButton>
                    ) : (
                      <GlowButton variant="ghost" size="sm" disabled>
                        No VC Offers
                      </GlowButton>
                    )}
                  </div>

                  {getFundingOffer(startup.stage) && (
                    <p className="text-[9px] text-center text-gray-500">
                      Raising funding will dilute your equity by {getFundingOffer(startup.stage).equity}%
                    </p>
                  )}

                  <div className="border-t border-white/[0.05] pt-3 mt-2">
                    <GlowButton
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={shutDownStartup}
                      icon={<AlertTriangle className="w-3.5 h-3.5" />}
                    >
                      Shut Down Startup (Forfeit Equity)
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            /* STARTUP MARKETPLACE (LAUNCH NEW STARTUP) */
            <div className="space-y-3">
              <motion.div variants={fadeUp}>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 px-1">Found a Startup</p>
              </motion.div>
              {STARTUP_TEMPLATES.map((template) => {
                const available = canFoundStartup(template.id);
                return (
                  <motion.div key={template.id} variants={fadeUp}>
                    <GlassCard glowColor={available ? 'green' : 'none'} hover={available} padding="md">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-bold text-gray-200">{template.name}</h3>
                            <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                              {template.sector}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono text-gray-500">
                            <div>Launch Cost: <span className="text-emerald-400 font-bold">{formatCurrency(template.requirements.cash)}</span></div>
                            <div>Monthly Burn: <span className="text-red-400 font-bold">{formatCurrency(template.monthlyBurn)}/mo</span></div>
                            <div>PMF Growth Chance: <span className="text-blue-400">{(template.marketFitProbability * 100).toFixed(0)}%</span></div>
                            <div>Rev Growth Rate: <span className="text-blue-400">{(template.revenueGrowthRate * 100).toFixed(0)}%</span></div>
                          </div>

                          <div className="mt-2.5 flex flex-wrap gap-2 text-[10px]">
                            {Object.entries(template.requirements.skills).map(([skill, val]) => {
                              const currentVal = (player.skills as unknown as Record<string, number>)[skill] || 0;
                              const met = currentVal >= (val || 0);
                              return (
                                <span key={skill} className={`px-1.5 py-0.5 rounded-md font-bold uppercase border ${
                                  met ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'
                                }`}>
                                  {skill} (Lvl {val})
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <GlowButton
                            size="sm"
                            variant={available ? 'primary' : 'ghost'}
                            onClick={() => foundStartup(template.id)}
                            disabled={!available}
                          >
                            Launch
                          </GlowButton>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SUBTAB CONTENT: REAL ESTATE */}
      {currentSubTab === 'properties' && (
        <>
          <motion.div variants={fadeUp} className="mb-4">
            <h1 className="font-heading text-xl font-bold text-gray-200">Real Estate Empire</h1>
            <p className="text-xs text-gray-500">Lease residential homes or acquire massive commercial office spaces</p>
          </motion.div>

          {/* Primary Residence Section */}
          <motion.div variants={fadeUp} className="mb-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2.5 px-1">Primary Residence</p>
            {(() => {
              const currentHome = properties.find((p) => p.isPlayerHome);
              const template = currentHome ? PROPERTY_TEMPLATES.find((t) => t.id === currentHome.templateId) : null;
              
              return (
                <GlassCard hover={false} glowColor="blue" padding="md" className="mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Current Living Space</p>
                      <h3 className="text-sm font-bold text-gray-200">{template?.name || 'Street Living'}</h3>
                      <p className="text-xs text-gray-400">
                        {template?.type === 'rental' 
                          ? `Rent: ${formatCurrency(template.monthlyRent)}/mo` 
                          : 'Owned Property'}
                        {template?.happinessBoost && template.happinessBoost !== 0 ? ` • Happiness: ${template.happinessBoost >= 0 ? '+' : ''}${template.happinessBoost}/mo` : ''}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              );
            })()}

            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 px-1">Rent / Move Options</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PROPERTY_TEMPLATES.filter((t) => t.type === 'rental').map((template) => {
                const isCurrent = properties.some((p) => p.templateId === template.id && p.isPlayerHome);
                return (
                  <GlassCard key={template.id} padding="sm" hover={!isCurrent} onClick={isCurrent ? undefined : () => changeHousing(template.id)}>
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-200">{template.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{template.description}</p>
                        <p className="text-[10px] text-blue-400 font-semibold font-mono mt-1">
                          Rent: {formatCurrency(template.monthlyRent)}/mo • Happiness: {template.happinessBoost >= 0 ? '+' : ''}{template.happinessBoost}/mo
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        isCurrent 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/[0.08]'
                      }`}>
                        {isCurrent ? 'Living' : 'Move In'}
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>

          {/* Investment Property Portfolio */}
          <motion.div variants={fadeUp} className="mb-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 px-1">Investment Portfolio</p>
            
            {properties.filter((p) => !p.isPlayerHome).length > 0 ? (
              <div className="space-y-3">
                {properties.filter((p) => !p.isPlayerHome).map((prop) => {
                  const template = PROPERTY_TEMPLATES.find((t) => t.id === prop.templateId);
                  const mortgage = prop.mortgageId ? loans.find((l) => l.id === prop.mortgageId) : null;
                  const profit = prop.monthlyRentIncome - (prop.purchasePrice * (template?.maintenanceCost || 0.01) / 12) - (prop.purchasePrice * (template?.propertyTax || 0.005) / 12) - (mortgage?.monthlyEMI || 0);

                  return (
                    <GlassCard key={prop.id} hover={false} glowColor="green" padding="md">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            {template?.type === 'commercial' ? <Landmark className="w-5 h-5 text-emerald-400" /> : <Building className="w-5 h-5 text-emerald-400" />}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-200">{template?.name || 'Investment Property'}</h3>
                            <p className="text-xs text-gray-500">Value: <span className="text-gray-300 font-bold font-mono">{formatCurrency(prop.currentValue)}</span> (Paid: {formatCurrency(prop.purchasePrice)})</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            profit >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {profit >= 0 ? '+' : ''}{formatCurrency(Math.round(profit))}/mo Cashflow
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 text-[10px] font-mono text-gray-500">
                        <div className="bg-white/[0.01] rounded-lg p-1.5 border border-white/[0.03]">
                          <span>Rent Income</span>
                          <p className="text-xs text-emerald-400 font-bold mt-0.5">+{formatCurrency(prop.monthlyRentIncome)}/mo</p>
                        </div>
                        <div className="bg-white/[0.01] rounded-lg p-1.5 border border-white/[0.03]">
                          <span>Expenses (Maint+Tax)</span>
                          <p className="text-xs text-red-400 mt-0.5">-{formatCurrency(Math.round((prop.purchasePrice * (template?.maintenanceCost || 0.01) + prop.purchasePrice * (template?.propertyTax || 0.005)) / 12))}/mo</p>
                        </div>
                        <div className="bg-white/[0.01] rounded-lg p-1.5 border border-white/[0.03]">
                          <span>Mortgage EMI</span>
                          <p className="text-xs text-red-400 mt-0.5">-{formatCurrency(Math.round(mortgage?.monthlyEMI || 0))}/mo</p>
                        </div>
                      </div>

                      {mortgage && (
                        <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-2.5 text-xs text-gray-400 mb-3 flex justify-between items-center">
                          <span>Mortgage Remaining: <span className="font-bold text-gray-200 font-mono">{formatCurrency(mortgage.remainingAmount)}</span></span>
                          <span className="text-[10px]">EMI: <span className="font-bold text-gray-200 font-mono">{formatCurrency(mortgage.monthlyEMI)}</span> ({mortgage.monthsPaid}/240m)</span>
                        </div>
                      )}

                      <GlowButton
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => sellProperty(prop.id)}
                        icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                      >
                        <span className="text-red-400 text-xs">Sell Property (95% Value, Settles Mortgage)</span>
                      </GlowButton>
                    </GlassCard>
                  );
                })}
              </div>
            ) : (
              <GlassCard hover={false} padding="md" className="text-center text-gray-500 text-xs py-6">
                No investment properties owned. Explore the acquisition marketplace below.
              </GlassCard>
            )}
          </motion.div>

          {/* Acquisition Marketplace */}
          <motion.div variants={fadeUp}>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 px-1">Acquisition Marketplace</p>
          </motion.div>
          <div className="space-y-3">
            {PROPERTY_TEMPLATES.filter((t) => t.type !== 'rental').map((template) => {
              const downPayment = template.purchasePrice * 0.3;
              const mortgageAmt = template.purchasePrice - downPayment;
              // Replicate EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
              const r = 0.085 / 12;
              const n = 240;
              const emi = mortgageAmt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
              
              const hasCash = player.cash >= downPayment;
              const hasCredit = !template.requirements.creditScore || player.creditScore >= template.requirements.creditScore;
              const hasNetWorth = !template.requirements.netWorth || player.netWorth >= template.requirements.netWorth;
              const meetsAll = hasCash && hasCredit && hasNetWorth;

              return (
                <motion.div key={template.id} variants={fadeUp}>
                  <GlassCard glowColor={meetsAll ? 'green' : 'none'} hover={meetsAll} padding="md">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {template.type === 'commercial' ? <Landmark className="w-4 h-4 text-emerald-400" /> : <Building className="w-4 h-4 text-blue-400" />}
                          <h4 className="text-sm font-bold text-gray-200">{template.name}</h4>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                        
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 text-[10px] font-mono text-gray-500">
                          <div>Purchase Price: <span className="text-gray-300 font-bold">{formatCurrency(template.purchasePrice)}</span></div>
                          <div>Down Payment (30%): <span className="text-emerald-400 font-bold">{formatCurrency(downPayment)}</span></div>
                          <div>Est. Monthly Rent: <span className="text-emerald-400 font-bold">+{formatCurrency(template.monthlyRent)}/mo</span></div>
                          <div>Est. Mortgage EMI: <span className="text-red-400 font-bold">-{formatCurrency(Math.round(emi))}/mo</span></div>
                          <div>Historical Apprec.: <span className="text-blue-400">{(template.appreciation * 100).toFixed(0)}%/yr</span></div>
                          <div>Maint + Tax: <span className="text-red-400 font-bold">{((template.maintenanceCost + template.propertyTax) * 100).toFixed(1)}%/yr</span></div>
                        </div>

                        {(template.requirements.creditScore || template.requirements.netWorth) && (
                          <div className="mt-2.5 flex flex-wrap gap-2 text-[9px] font-bold font-mono">
                            {template.requirements.creditScore && (
                              <span className={`px-1.5 py-0.5 rounded border ${
                                hasCredit ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'
                              }`}>
                                Credit Score: {template.requirements.creditScore}
                              </span>
                            )}
                            {template.requirements.netWorth && (
                              <span className={`px-1.5 py-0.5 rounded border ${
                                hasNetWorth ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'
                              }`}>
                                Net Worth: {formatCurrency(template.requirements.netWorth)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <GlowButton
                          size="sm"
                          variant={meetsAll ? 'primary' : 'ghost'}
                          onClick={() => buyProperty(template.id)}
                          disabled={!meetsAll}
                        >
                          Acquire
                        </GlowButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
