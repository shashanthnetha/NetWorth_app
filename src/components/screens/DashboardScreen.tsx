'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Briefcase,
  Building2,
  GraduationCap,
  Wallet,
  Heart,
  Zap,
  Brain,
  Star,
  ChevronRight,
  Play,
  Pause,
  Rocket,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Sparkles,
  Info
} from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import { JOBS } from '../../engine/gameData';
import { formatCurrency, formatGameDate, formatPercent } from '../../lib/utils';
import { calculatePortfolioValue, calculatePortfolioGainLoss } from '../../engine/marketEngine';
import { getActiveSeasonalEffects } from '../../engine/seasonSystem';
import GlassCard from '../ui/GlassCard';
import AnimatedNumber from '../ui/AnimatedNumber';
import GlowButton from '../ui/GlowButton';
import ProgressBar from '../ui/ProgressBar';
import MiniChart from '../ui/MiniChart';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardScreen() {
  const player = useGameStore((s) => s.player);
  const meta = useGameStore((s) => s.meta);
  const market = useGameStore((s) => s.market);
  const businesses = useGameStore((s) => s.businesses);
  const loans = useGameStore((s) => s.loans);
  const advanceMonth = useGameStore((s) => s.advanceMonth);
  const setScreen = useGameStore((s) => s.setScreen);
  const isAdvancing = useGameStore((s) => s.ui.isAdvancingMonth);
  const eventHistory = useGameStore((s) => s.eventHistory);
  const newsFeed = useGameStore((s) => s.newsFeed);
  const challenges = useGameStore((s) => s.challenges);
  
  const soundEnabled = useGameStore((s) => s.meta.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  const togglePause = useGameStore((s) => s.togglePause);
  const setGameSpeed = useGameStore((s) => s.setGameSpeed);
  const isPaused = useGameStore((s) => s.meta.isPaused);
  const skipTime = useGameStore((s) => s.skipTime);
  const buySpeedBoost = useGameStore((s) => s.buySpeedBoost);
  const keepPlayingInfinite = useGameStore((s) => s.keepPlayingInfinite);

  const [showTimeWarpModal, setShowTimeWarpModal] = useState(false);

  const previousNetWorth = player.netWorthHistory.length > 1
    ? player.netWorthHistory[player.netWorthHistory.length - 2]
    : player.netWorth;

  const netWorthChange = player.netWorth - previousNetWorth;

  const portfolioValue = calculatePortfolioValue({ market } as Parameters<typeof calculatePortfolioValue>[0]);
  const portfolioGL = calculatePortfolioGainLoss({ market } as Parameters<typeof calculatePortfolioGainLoss>[0]);

  const totalDebt = loans.reduce((sum, l) => sum + l.remainingAmount, 0);
  const businessProfit = businesses.reduce((sum, b) => sum + (b.monthlyRevenue - b.monthlyExpenses), 0);

  const currentJob = player.currentJob
    ? JOBS.find((j) => j.id === player.currentJob!.jobId)
    : null;

  const recentEvents = eventHistory.slice(-3).reverse();

  // News feed limit to latest 5 items
  const latestNews = newsFeed.slice(0, 5);

  // Active seasonal effects
  const activeSeasons = getActiveSeasonalEffects(meta.currentMonth);

  return (
    <motion.div
      className="page-container"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* CSS Styles for Ticker tape */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase font-mono">
            {formatGameDate(meta.currentMonth)}
          </p>
          <h1 className="font-heading text-lg font-bold text-gray-200">
            Hey, {player.name} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {toggleSound && (
            <button 
              onClick={toggleSound}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-gray-200 active:scale-95 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
            <span className="text-xs font-mono font-bold text-yellow-300">{player.wealthTokens}</span>
          </div>
        </div>
      </motion.div>

      {/* Time Control Card */}
      <motion.div variants={fadeUp} className="mb-4">
        <GlassCard padding="md" glowColor={isPaused ? "gold" : "green"} hover={false} className="border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
                <Calendar className="w-5.5 h-5.5 text-emerald-400" />
                {!isPaused && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase font-mono tracking-wider">
                    TIMELINE PROGRESSION
                  </p>
                  {meta.infiniteModeActive && (
                    <span className="text-[8px] px-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded uppercase font-semibold">
                      Infinite
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-200 font-heading">
                  Month {meta.currentMonth}, Day {meta.currentDay}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {meta.speedBoostRemainingDays > 0 
                    ? `🚀 Speed Boost: ${meta.gameSpeed}x (${meta.speedBoostRemainingDays} days left)` 
                    : `Current Speed: ${meta.gameSpeed}x`}
                </p>
              </div>
            </div>

            {/* Play/Pause & Speed Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePause}
                className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                  isPaused 
                    ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                    : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]'
                }`}
              >
                {isPaused ? <Play className="w-4.5 h-4.5 fill-yellow-400/10" /> : <Pause className="w-4.5 h-4.5" />}
              </button>

              <button
                onClick={() => setGameSpeed(1)}
                className={`px-3 py-2 text-xs font-mono font-bold rounded-xl border transition-all active:scale-95 ${
                  meta.gameSpeed === 1 && !isPaused
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]'
                }`}
              >
                1x
              </button>

              <button
                onClick={() => setGameSpeed(2)}
                className={`px-3 py-2 text-xs font-mono font-bold rounded-xl border transition-all active:scale-95 ${
                  meta.gameSpeed === 2 && !isPaused
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]'
                }`}
              >
                2x
              </button>

              <button
                onClick={() => setShowTimeWarpModal(true)}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 hover:text-purple-300 transition-all active:scale-95 flex items-center justify-center animate-pulse"
                title="Time Warp & Speed Boosts"
              >
                <Rocket className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* News Ticker Tape */}
      {latestNews.length > 0 && (
        <motion.div variants={fadeUp} className="mb-4">
          <div className="bg-[#0D0D0D]/60 border border-amber-500/15 rounded-xl px-3 py-1.5 flex items-center gap-2 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.02)]">
            <span className="text-[9px] bg-amber-500/15 text-amber-400 font-extrabold uppercase px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0 flex items-center gap-1 font-heading">
              <span>⚡</span> NEWS
            </span>
            <div className="flex-1 overflow-hidden relative">
              <div className="animate-marquee whitespace-nowrap text-[11px] font-medium text-gray-400 gap-8">
                {latestNews.map((news) => (
                  <span key={news.id} className="inline-flex items-center gap-1 mr-8">
                    <span>{news.icon}</span>
                    <span className="font-bold text-gray-200">{news.headline}</span>
                    <span className="text-gray-500">— {news.description}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Seasonal Active Banner */}
      {activeSeasons.length > 0 && (
        <motion.div variants={fadeUp} className="mb-4 space-y-2">
          {activeSeasons.map((season) => (
            <GlassCard
              key={season.id}
              glowColor="gold"
              padding="sm"
              className="bg-gradient-to-r from-amber-500/10 to-purple-500/5 border border-amber-500/20 relative overflow-hidden"
              hover={false}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{season.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-yellow-300 flex items-center gap-1.5 uppercase font-heading">
                    Active Event: {season.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{season.description}</p>
                  
                  {/* Modifiers List */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {season.effects.businessRevenueMultiplier && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono font-medium">
                        Business Revenue: {season.effects.businessRevenueMultiplier > 1 ? '+' : ''}{Math.round((season.effects.businessRevenueMultiplier - 1) * 100)}%
                      </span>
                    )}
                    {season.effects.stockMarketMultiplier && (
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono font-medium">
                        Stock Market: {season.effects.stockMarketMultiplier > 1 ? '+' : ''}{Math.round((season.effects.stockMarketMultiplier - 1) * 100)}%
                      </span>
                    )}
                    {season.effects.salaryBonus && (
                      <span className="text-[9px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono font-medium">
                        Salary Bonus: +{Math.round(season.effects.salaryBonus * 100)}%
                      </span>
                    )}
                    {season.effects.expenseMultiplier && (
                      <span className="text-[9px] bg-orange-500/10 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/20 font-mono font-medium">
                        Expenses: {season.effects.expenseMultiplier > 1 ? '+' : ''}{Math.round((season.effects.expenseMultiplier - 1) * 100)}%
                      </span>
                    )}
                    {season.effects.taxChanges && (
                      <span className="text-[9px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono font-medium">
                        Tax Slabs: {season.effects.taxChanges * 100}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      )}

      {/* Net Worth Hero */}
      <motion.div variants={fadeUp}>
        <GlassCard
          glowColor={netWorthChange >= 0 ? 'green' : 'red'}
          hover={false}
          padding="lg"
          className="mb-4 relative overflow-hidden"
        >
          {/* Background chart */}
          <div className="absolute inset-0 opacity-20">
            <MiniChart data={player.netWorthHistory} height={120} color="green" />
          </div>

          <div className="relative z-10">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">NET WORTH</p>
            <AnimatedNumber
              value={player.netWorth}
              previousValue={previousNetWorth}
              format="currency"
              size="hero"
              showChange
            />

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${netWorthChange >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={`text-xs font-mono font-bold ${netWorthChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netWorthChange >= 0 ? '+' : ''}{formatCurrency(netWorthChange)}/mo
                </span>
              </div>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-500">Month {meta.currentMonth} of {meta.totalMonths}</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-4">
        <GlassCard padding="sm" glowColor="green" onClick={() => setScreen('finance')}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Cash</p>
          <p className="font-mono text-lg font-bold text-gray-200 mt-0.5">{formatCurrency(player.cash)}</p>
        </GlassCard>

        <GlassCard padding="sm" glowColor="blue" onClick={() => setScreen('career')}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Monthly Income</p>
          <p className="font-mono text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(player.monthlyIncome)}</p>
        </GlassCard>

        <GlassCard padding="sm" glowColor="red" onClick={() => setScreen('finance')}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Debt</p>
          <p className={`font-mono text-lg font-bold mt-0.5 ${totalDebt > 0 ? 'text-red-400' : 'text-gray-500'}`}>
            {totalDebt > 0 ? formatCurrency(totalDebt) : '₹0'}
          </p>
        </GlassCard>

        <GlassCard padding="sm" glowColor="purple" onClick={() => setScreen('invest')}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Portfolio</p>
          <p className="font-mono text-lg font-bold text-gray-200 mt-0.5">{formatCurrency(portfolioValue)}</p>
          {portfolioGL.gainLossPercent !== 0 && (
            <p className={`text-[10px] font-mono ${portfolioGL.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPercent(portfolioGL.gainLossPercent)}
            </p>
          )}
        </GlassCard>
      </motion.div>

      {/* Current Job & Studying Row */}
      {(currentJob || player.activeEducation) && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-3 mb-4">
          {currentJob && (
            <GlassCard glowColor="cyan" onClick={() => setScreen('career')} padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">{currentJob.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(currentJob.salary)}/mo • {player.currentJob!.monthsWorked}mo experience
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
              <ProgressBar
                value={player.currentJob!.performance}
                label="Performance"
                showPercent
                color="cyan"
                size="sm"
                className="mt-3"
              />
            </GlassCard>
          )}

          {player.activeEducation && (
            <GlassCard glowColor="purple" onClick={() => setScreen('career')} padding="md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-400/70 font-semibold">Studying</p>
                  <p className="text-sm font-semibold text-gray-300">
                    {player.activeEducation.educationId.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <ProgressBar
                value={player.activeEducation.monthsCompleted}
                max={player.activeEducation.totalMonths}
                sublabel={`${player.activeEducation.monthsCompleted}/${player.activeEducation.totalMonths} months`}
                showPercent
                color="purple"
                size="sm"
              />
            </GlassCard>
          )}
        </motion.div>
      )}

      {/* Life Stats */}
      <motion.div variants={fadeUp} className="mb-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-1">Life Stats</p>
        <GlassCard hover={false} padding="md">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <ProgressBar
                value={player.stats.health}
                color={player.stats.health < 30 ? 'red' : 'green'}
                size="sm"
                label="Health"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">😊</span>
              <ProgressBar
                value={player.stats.happiness}
                color={player.stats.happiness < 30 ? 'red' : 'blue'}
                size="sm"
                label="Happy"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <ProgressBar
                value={player.stats.energy}
                color={player.stats.energy < 30 ? 'red' : 'gold'}
                size="sm"
                label="Energy"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <ProgressBar
                value={player.stats.motivation}
                color={player.stats.motivation < 30 ? 'red' : 'purple'}
                size="sm"
                label="Motivation"
                className="flex-1"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Challenges Section */}
      {challenges.length > 0 && (
        <motion.div variants={fadeUp} className="mb-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-1">Active Challenges</p>
          <div className="space-y-2">
            {challenges.map((c) => (
              <GlassCard
                key={c.id}
                padding="sm"
                glowColor={c.isCompleted ? 'green' : 'gold'}
                hover={false}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base shrink-0">{c.icon}</span>
                      <p className="text-xs font-bold text-gray-200 truncate">{c.title}</p>
                      <span className={`text-[8px] px-1 py-0.5 rounded uppercase font-semibold shrink-0 ${
                        c.type === 'daily' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        c.type === 'weekly' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {c.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{c.description}</p>
                    
                    <div className="mt-2">
                      <ProgressBar 
                        value={c.progress} 
                        max={c.condition.target} 
                        color={c.isCompleted ? 'green' : 'gold'} 
                        size="sm" 
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 font-mono mt-1 text-right">
                      {Math.round(c.progress).toLocaleString()} / {c.condition.target.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                    <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                      +{c.reward} <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
                    </span>
                    {c.isCompleted ? (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded font-semibold uppercase">
                        Done
                      </span>
                    ) : (
                      <span className="text-[8px] text-gray-500 font-medium font-mono">
                        Ends M{c.expiresMonth}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="mb-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-1">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Briefcase className="w-5 h-5" />, label: 'Career', screen: 'career' as const, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/15' },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'Invest', screen: 'invest' as const, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15' },
            { icon: <Building2 className="w-5 h-5" />, label: 'Empire', screen: 'empire' as const, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15' },
            { icon: <Wallet className="w-5 h-5" />, label: 'Finance', screen: 'finance' as const, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/15' },
          ].map((action) => (
            <motion.button
              key={action.label}
              onClick={() => setScreen(action.screen)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:scale-[1.03] ${action.bg}`}
              whileTap={{ scale: 0.95 }}
            >
              <span className={action.color}>{action.icon}</span>
              <span className="text-[10px] text-gray-400 font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <motion.div variants={fadeUp} className="mb-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-1">Recent Events</p>
          <div className="space-y-2">
            {recentEvents.map((event, i) => (
              <motion.div
                key={event.id}
                className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-lg">{event.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-300 truncate">{event.title}</p>
                  <p className="text-[10px] text-gray-600">Month {event.month}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Game Progress */}
      <motion.div variants={fadeUp} className="mb-6">
        <ProgressBar
          value={meta.currentMonth}
          max={meta.infiniteModeActive ? 0 : meta.totalMonths}
          label="Journey Progress"
          sublabel={meta.infiniteModeActive ? `Month ${meta.currentMonth} (Infinite Mode 🚀)` : `${meta.currentMonth}/${meta.totalMonths} months`}
          showPercent={!meta.infiniteModeActive}
          color="cyan"
          size="sm"
        />
      </motion.div>

      {/* Timeline Control Status or Retirement Actions */}
      {meta.totalMonths > 0 && meta.currentMonth >= meta.totalMonths && !meta.infiniteModeActive ? (
        <motion.div variants={fadeUp} className="mb-4">
          <GlassCard padding="lg" glowColor="gold" hover={false} className="border border-yellow-500/20 bg-yellow-500/5">
            <h3 className="text-sm font-bold text-yellow-300 uppercase font-heading flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" /> Retirement Target Reached!
            </h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Congratulations! You have completed the 30-year target path with a final Net Worth of <strong className="text-gray-200">{formatCurrency(player.netWorth)}</strong>. What is your next move, tycoon?
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <GlowButton
                variant="primary"
                fullWidth
                onClick={keepPlayingInfinite}
                className="!py-3"
              >
                Keep Playing (Infinite Mode) 🚀
              </GlowButton>
              <GlowButton
                variant="ghost"
                fullWidth
                onClick={() => useGameStore.getState().resetGame()}
                className="!py-3 border border-white/10"
              >
                Retire & Start Fresh
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="mb-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400">
                {isPaused ? 'Timeline is Paused' : `Speed: ${meta.gameSpeed}x • Days ticking...`}
              </span>
            </div>
            <button
              onClick={togglePause}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
            >
              {isPaused ? 'Resume Timeline' : 'Pause'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Time Warp / Stars Shop Modal */}
      {showTimeWarpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0E0E10] p-5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-3 right-3">
              <button 
                onClick={() => setShowTimeWarpModal(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-gray-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-gray-200 font-heading">Time Warp & Speed Boosts</h3>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                <span className="text-xs font-semibold text-yellow-300">Your Wealth Tokens</span>
              </div>
              <span className="text-sm font-bold text-yellow-300 font-mono">{player.wealthTokens} Stars</span>
            </div>

            {/* Time Skips Section */}
            <div className="mb-4">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 font-mono">
                Instant Time Skips (Fast Forward)
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Skip 1 Month', duration: 1, cost: 15 },
                  { label: 'Skip 3 Months', duration: 3, cost: 40 },
                  { label: 'Skip 1 Year', duration: 12, cost: 150 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      const success = skipTime(item.duration);
                      if (success) setShowTimeWarpModal(false);
                    }}
                    disabled={player.wealthTokens < item.cost}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:hover:bg-transparent transition-all text-left cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-gray-300">{item.label}</p>
                      <p className="text-[10px] text-gray-500">Auto-process EMIs, salary, & market ticks</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-500/15 px-2 py-0.5 rounded border border-yellow-500/20 shrink-0">
                      {item.cost} Stars
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Boosts Section */}
            <div>
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 font-mono">
                Daily Timeline Speed Boosts
              </h4>
              <div className="space-y-2">
                {[
                  { label: '3x Speed Boost (30 Days)', key: '3x_1mo' as const, cost: 5, desc: 'Flow day-by-day 3x faster' },
                  { label: '5x Speed Boost (90 Days)', key: '5x_3mo' as const, cost: 12, desc: 'Maximum time progression rate' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      const success = buySpeedBoost(item.key);
                      if (success) setShowTimeWarpModal(false);
                    }}
                    disabled={player.wealthTokens < item.cost}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:hover:bg-transparent transition-all text-left cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-gray-300">{item.label}</p>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-500/15 px-2 py-0.5 rounded border border-yellow-500/20 shrink-0">
                      {item.cost} Stars
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
