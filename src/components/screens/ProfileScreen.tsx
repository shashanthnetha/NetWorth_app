'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Trophy, Heart, Zap, Brain, Star, Eye, Volume2, VolumeX, RotateCcw, 
  Calendar, Target, TrendingUp, Briefcase, Building2, GraduationCap,
  Users, Gem, Car, Clock, ShieldCheck, HeartCrack, Baby, Smile, Coins
} from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import { JOBS } from '../../engine/gameData';
import { STATUS_ITEMS, calculateFlexScore, calculateStatusMonthlyCost } from '../../engine/socialStatusData';
import { formatCurrency, formatGameDate, formatDuration } from '../../lib/utils';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import ProgressBar from '../ui/ProgressBar';
import MiniChart from '../ui/MiniChart';
import { GOAL_TEMPLATES, createGoalFromTemplate, createCustomGoal } from '../../engine/goalsSystem';
import { FinancialGoal } from '../../engine/types';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProfileScreen() {
  const player = useGameStore((s) => s.player);
  const meta = useGameStore((s) => s.meta);
  const businesses = useGameStore((s) => s.businesses);
  const achievements = useGameStore((s) => s.achievements);
  const family = useGameStore((s) => s.family);
  
  const toggleSound = useGameStore((s) => s.toggleSound);
  const resetGame = useGameStore((s) => s.resetGame);
  
  const startDating = useGameStore((s) => s.startDating);
  const getMarried = useGameStore((s) => s.getMarried);
  const haveKid = useGameStore((s) => s.haveKid);
  const divorce = useGameStore((s) => s.divorce);
  const buyStatusItem = useGameStore((s) => s.buyStatusItem);
  const goals = useGameStore((s) => s.goals);
  const addGoal = useGameStore((s) => s.addGoal);
  const removeGoal = useGameStore((s) => s.removeGoal);

  const [activeTab, setActiveTab] = useState<'identity' | 'family' | 'status' | 'goals'>('identity');
  
  // Custom goal creation state
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalTarget, setCustomGoalTarget] = useState(100000);
  const [customGoalDeadline, setCustomGoalDeadline] = useState(12);
  const [showCustomGoalForm, setShowCustomGoalForm] = useState(false);
  
  // Marriage choices state
  const [weddingTier, setWeddingTier] = useState<'simple' | 'standard' | 'grand' | 'royal'>('standard');
  const [hasPrenup, setHasPrenup] = useState(true);

  // Status marketplace filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'vehicle' | 'watch' | 'clothing'>('all');

  const currentJob = player.currentJob
    ? JOBS.find((j) => j.id === player.currentJob!.jobId)
    : null;

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

  const statItems = [
    { icon: <Heart className="w-4 h-4 text-red-400" />, label: 'Health', value: player.stats.health, color: player.stats.health < 30 ? 'red' as const : 'green' as const },
    { icon: <span className="text-sm">😊</span>, label: 'Happiness', value: player.stats.happiness, color: player.stats.happiness < 30 ? 'red' as const : 'blue' as const },
    { icon: <Zap className="w-4 h-4 text-yellow-400" />, label: 'Energy', value: player.stats.energy, color: player.stats.energy < 30 ? 'red' as const : 'gold' as const },
    { icon: <Brain className="w-4 h-4 text-purple-400" />, label: 'Motivation', value: player.stats.motivation, color: player.stats.motivation < 30 ? 'red' as const : 'purple' as const },
    { icon: <Star className="w-4 h-4 text-cyan-400" />, label: 'Reputation', value: player.stats.reputation, color: player.stats.reputation < 30 ? 'red' as const : 'cyan' as const },
  ];

  const weddingTierOptions = [
    { key: 'simple' as const, label: 'Simple Wedding', cost: 200000, income: 20000 },
    { key: 'standard' as const, label: 'Standard Wedding', cost: 1000000, income: 35000 },
    { key: 'grand' as const, label: 'Grand Celebration', cost: 5000000, income: 50000 },
    { key: 'royal' as const, label: 'Royal Wedding', cost: 20000000, income: 80000 },
  ];

  return (
    <motion.div className="page-container pb-20" variants={stagger} initial="hidden" animate="show">
      {/* Header Info */}
      <motion.div variants={fadeUp} className="text-center mb-4">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-2"
          animate={{ boxShadow: ['0 0 15px rgba(0,255,178,0.1)', '0 0 30px rgba(0,255,178,0.2)', '0 0 15px rgba(0,255,178,0.1)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-2xl font-heading font-bold text-emerald-300">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </motion.div>
        <h1 className="font-heading text-lg font-bold">{player.name}</h1>
        <p className="text-[10px] text-gray-500">{formatGameDate(meta.currentMonth)} • {currentJob ? currentJob.title : 'Unemployed'}</p>
      </motion.div>

      {/* Screen Tabs */}
      <motion.div variants={fadeUp} className="flex border-b border-white/[0.06] mb-4 gap-4 overflow-x-auto no-scrollbar">
        {['Identity', 'Family', 'Status Items', 'Goals'].map((tabLabel, idx) => {
          const tabKeys: ('identity' | 'family' | 'status' | 'goals')[] = ['identity', 'family', 'status', 'goals'];
          const tabKey = tabKeys[idx];
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
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
        {/* IDENTITY TAB */}
        {activeTab === 'identity' && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 text-center">
                <Calendar className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                <p className="text-base font-mono font-bold text-gray-200">{meta.currentMonth}</p>
                <p className="text-[8px] text-gray-500 uppercase font-semibold">Months Old</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 text-center">
                <Trophy className="w-3.5 h-3.5 text-yellow-500 mx-auto mb-1" />
                <p className="text-base font-mono font-bold text-yellow-300">{unlockedAchievements.length}</p>
                <p className="text-[8px] text-gray-500 uppercase font-semibold">Unlocked</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 text-center">
                <Coins className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
                <p className="text-base font-mono font-bold text-emerald-300">{player.wealthTokens}</p>
                <p className="text-[8px] text-gray-500 uppercase font-semibold">Wealth Tokens</p>
              </div>
            </div>

            {/* Net Worth Chart */}
            <GlassCard hover={false} padding="md">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Wealth History Curve</p>
              <MiniChart data={player.netWorthHistory} height={80} color="green" />
              <div className="flex justify-between mt-2 text-[9px] text-gray-600 font-mono">
                <span>Month 1</span>
                <span>Month {meta.currentMonth}</span>
              </div>
            </GlassCard>

            {/* Life Stats Bars */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Personal Attributes</p>
              <GlassCard hover={false} padding="md">
                <div className="space-y-3">
                  {statItems.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-5 flex justify-center">{stat.icon}</span>
                      <ProgressBar
                        value={stat.value}
                        label={stat.label}
                        showPercent
                        color={stat.color}
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Lifetime Metrics */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Career & Business Log</p>
              <GlassCard hover={false} padding="sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <div>
                      <p className="text-[9px] text-gray-500">Peak Net Worth</p>
                      <p className="font-mono text-gray-200 font-bold">{formatCurrency(Math.max(...player.netWorthHistory, player.netWorth))}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <p className="text-[9px] text-gray-500">Career Experience</p>
                      <p className="font-mono text-gray-200 font-bold">{formatDuration(player.experience)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <p className="text-[9px] text-gray-500">Businesses Running</p>
                      <p className="font-mono text-gray-200 font-bold">{businesses.length} active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    <div>
                      <p className="text-[9px] text-gray-500">Education Cleared</p>
                      <p className="font-mono text-gray-200 font-bold">{player.completedEducation.length} degrees</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Achievements Grid */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">
                Trophy Case ({unlockedAchievements.length} / {achievements.length})
              </p>
              
              {unlockedAchievements.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {unlockedAchievements.map((ach) => (
                    <motion.div
                      key={ach.id}
                      className="bg-yellow-500/[0.06] border border-yellow-500/10 rounded-xl p-2 text-center"
                      whileHover={{ scale: 1.03 }}
                    >
                      <span className="text-lg block mb-1">{ach.icon}</span>
                      <p className="text-[9px] font-bold text-yellow-300 truncate">{ach.title}</p>
                      <p className="text-[8px] text-gray-500">+{ach.reward} Tokens</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Locked Preview */}
              <div className="grid grid-cols-3 gap-2">
                {lockedAchievements.slice(0, 3).map((ach) => (
                  <div
                    key={ach.id}
                    className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 text-center opacity-40"
                  >
                    <span className="text-lg block mb-1">🔒</span>
                    <p className="text-[9px] font-bold text-gray-500 truncate">{ach.title}</p>
                    <p className="text-[8px] text-gray-600">+{ach.reward} Tokens</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Card */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">System Settings</p>
              <GlassCard padding="sm" hover={false}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {meta.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                    <span className="text-xs text-gray-300">Sound Effects & Haptics</span>
                  </div>
                  <div 
                    onClick={toggleSound}
                    className={`w-10 h-5 rounded-full cursor-pointer transition-all ${meta.soundEnabled ? 'bg-emerald-500/30' : 'bg-white/10'}`}
                  >
                    <motion.div
                      className={`w-5 h-5 rounded-full border-2 ${meta.soundEnabled ? 'bg-emerald-400 border-emerald-300' : 'bg-gray-500 border-gray-400'}`}
                      animate={{ x: meta.soundEnabled ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>

                <GlowButton
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    if (confirm('CAUTION: This will wipe your financial empire profile and local saves forever. Proceed?')) {
                      resetGame();
                    }
                  }}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Hard Reset Game State
                </GlowButton>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* FAMILY SUBTAB */}
        {activeTab === 'family' && (
          <motion.div
            key="family"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Relationship Status Header */}
            <GlassCard hover={false} padding="md" glowColor={family.relationshipStatus === 'married' ? 'green' : family.relationshipStatus === 'dating' ? 'purple' : 'none'}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Relationship Status</p>
                  <h2 className="text-lg font-bold text-gray-200 mt-1 capitalize">
                    {family.relationshipStatus === 'single' && 'Single & Solo'}
                    {family.relationshipStatus === 'dating' && `Dating ${family.partnerName}`}
                    {family.relationshipStatus === 'married' && `Married to ${family.partnerName}`}
                    {family.relationshipStatus === 'divorced' && 'Divorced'}
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {family.relationshipStatus === 'single' && 'Focusing on career. Dating costs are ₹0/mo.'}
                    {family.relationshipStatus === 'dating' && `Together for ${family.dateMonthsElapsed} months. Dating costs: ₹5,000/mo.`}
                    {family.relationshipStatus === 'married' && `Wedding cost: ${formatCurrency(family.weddingCost)} • Partner Income: ${formatCurrency(family.partnerIncome)}/mo`}
                    {family.relationshipStatus === 'divorced' && 'Alone again. Asset split finalized.'}
                  </p>
                </div>
                <Users className={`w-8 h-8 ${family.relationshipStatus === 'married' ? 'text-emerald-400' : family.relationshipStatus === 'dating' ? 'text-pink-400' : 'text-gray-500'}`} />
              </div>
            </GlassCard>

            {/* Dating/Marriage Actions */}
            {family.relationshipStatus === 'single' && (
              <GlassCard hover={false} padding="md">
                <div className="text-center py-3">
                  <p className="text-xs text-gray-400 mb-4">You are currently living alone. Ready to seek a relationship partner?</p>
                  <GlowButton variant="primary" onClick={startDating}>
                    Start Dating (Outflow: ₹5,000/mo)
                  </GlowButton>
                </div>
              </GlassCard>
            )}

            {family.relationshipStatus === 'dating' && (
              <GlassCard hover={false} padding="md" glowColor="gold">
                <div className="flex items-center gap-2 mb-4">
                  <Gem className="w-4 h-4 text-yellow-400 animate-bounce" />
                  <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Marriage Planner Panel</span>
                </div>

                <div className="space-y-4">
                  {/* Wedding Tier Select */}
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1.5 block">Select Ceremony Tier</label>
                    <div className="grid grid-cols-2 gap-2">
                      {weddingTierOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setWeddingTier(opt.key)}
                          className={`p-2 text-left rounded-lg border transition-all ${
                            weddingTier === opt.key
                              ? 'bg-yellow-400/10 border-yellow-400 text-yellow-300 font-bold'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <p className="text-xs">{opt.label}</p>
                          <p className="text-[9px] text-gray-400 font-mono mt-0.5">Cost: {formatCurrency(opt.cost)}</p>
                          <p className="text-[8px] text-emerald-400 font-mono">Partner Salary: {formatCurrency(opt.income)}/mo</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prenup agreement toggle */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">Sign Prenuptial Agreement</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Limits asset loss to 10% (instead of 30%) in case of divorce.</p>
                    </div>
                    <div 
                      onClick={() => setHasPrenup(!hasPrenup)}
                      className={`w-10 h-5 rounded-full cursor-pointer transition-all ${hasPrenup ? 'bg-cyan-500/30' : 'bg-white/10'}`}
                    >
                      <motion.div
                        className={`w-5 h-5 rounded-full border-2 ${hasPrenup ? 'bg-cyan-400 border-cyan-300' : 'bg-gray-500 border-gray-400'}`}
                        animate={{ x: hasPrenup ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>

                  <GlowButton
                    variant="primary"
                    fullWidth
                    disabled={player.cash < weddingTierOptions.find(o => o.key === weddingTier)!.cost}
                    onClick={() => {
                      getMarried(weddingTier, hasPrenup);
                    }}
                  >
                    Commit Marriage Vows
                  </GlowButton>
                </div>
              </GlassCard>
            )}

            {family.relationshipStatus === 'married' && (
              <div className="grid grid-cols-2 gap-2">
                <GlassCard hover={false} padding="sm" glowColor="cyan" className="flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Expand Family</p>
                    <p className="text-[10px] text-gray-500 mt-1">Raise a child. Adds ₹10,000/mo maintenance cost. Schooling begins at age 5.</p>
                  </div>
                  <GlowButton
                    variant="primary"
                    fullWidth
                    className="mt-3"
                    onClick={haveKid}
                  >
                    <Baby className="w-3.5 h-3.5 mr-1" /> Have a Kid
                  </GlowButton>
                </GlassCard>

                <GlassCard hover={false} padding="sm" glowColor="red" className="flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">File for Divorce</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {family.hasPrenup 
                        ? 'Prenup active: You will lose 10% of your accumulated net worth.' 
                        : 'No prenup: You will lose 30% of your net worth.'}
                    </p>
                  </div>
                  <GlowButton
                    variant="danger"
                    fullWidth
                    className="mt-3"
                    onClick={() => {
                      if (confirm('WARNING: Divorce split will divide assets. Confirm file?')) {
                        divorce();
                      }
                    }}
                  >
                    <HeartCrack className="w-3.5 h-3.5 mr-1" /> Divorce
                  </GlowButton>
                </GlassCard>
              </div>
            )}

            {family.relationshipStatus === 'divorced' && (
              <GlassCard hover={false} padding="md">
                <div className="text-center py-2">
                  <p className="text-xs text-gray-400 mb-3">You are currently living single. Ready to look for new relationships?</p>
                  <GlowButton variant="primary" onClick={startDating}>
                    Start Dating Again (₹5,000/mo)
                  </GlowButton>
                </div>
              </GlassCard>
            )}

            {/* Kids Section */}
            {family.kids.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-1">Children & Dependents ({family.kids.length})</p>
                <div className="space-y-2">
                  {family.kids.map((kid) => (
                    <GlassCard key={kid.id} hover={false} padding="sm" glowColor="cyan">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                          👶 {kid.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Age: {Math.floor(kid.age / 12)} years ({kid.age} months)</span>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-gray-400 mt-2 border-t border-white/[0.04] pt-2">
                        <span>Education Tier: <strong className="text-cyan-400 uppercase">{kid.educationTier}</strong></span>
                        <span>Monthly Cost: {formatCurrency(kid.monthlyCost)}/mo</span>
                        {kid.educationCost > 0 && (
                          <span className="text-amber-400 font-semibold">Education: {formatCurrency(kid.educationCost)}/mo</span>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STATUS SUBTAB */}
        {activeTab === 'status' && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Status overview cards */}
            <GlassCard hover={false} padding="md" glowColor="gold">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Social Reputation Flex Score</p>
                  <p className="text-2xl font-mono font-bold text-yellow-400 mt-1">
                    {calculateFlexScore(player.ownedStatusItems)} Points
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-right text-gray-400 uppercase tracking-wider font-semibold">Monthly Upkeep Cost</p>
                  <p className="text-sm font-mono font-bold text-rose-400 mt-1">
                    -{formatCurrency(calculateStatusMonthlyCost(player.ownedStatusItems))}/mo
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-gray-500 mt-2 leading-relaxed">
                Reputation flex score boosts your Promotion chances and unlocks High-Income Jobs and Elite Business partnerships. Maintenance cost is auto-debited monthly.
              </p>
            </GlassCard>

            {/* Filter buttons */}
            <div className="flex gap-2">
              {['all', 'vehicle', 'watch', 'clothing'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f as any)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                    statusFilter === f
                      ? 'bg-amber-400/20 text-yellow-300 border border-yellow-400/30'
                      : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Status Catalog */}
            <div className="space-y-2.5">
              {STATUS_ITEMS.filter((item) => statusFilter === 'all' || item.category === statusFilter).map((item) => {
                const isOwned = player.ownedStatusItems.includes(item.id);
                return (
                  <GlassCard key={item.id} hover={!isOwned} padding="sm" glowColor={isOwned ? 'none' : 'gold'}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <span className="text-2xl mt-0.5">{item.icon}</span>
                        <div>
                          <h3 className="text-xs font-bold text-gray-100">{item.name}</h3>
                          <p className="text-[9px] text-gray-400 leading-normal mt-0.5">{item.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-gray-200">
                          {item.cost > 0 ? formatCurrency(item.cost) : 'Cost per Month'}
                        </p>
                        <p className="text-[8px] text-gray-500 mt-0.5">
                          {item.monthlyCost > 0 ? `Upkeep: ${formatCurrency(item.monthlyCost)}/mo` : 'Free Maintenance'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/[0.04] pt-2 mt-2">
                      <span className="text-yellow-400 font-semibold">+{item.reputationBoost} Reputation Boost</span>
                      <span className="text-pink-400">+{item.happinessBoost} Happiness</span>
                      
                      {isOwned ? (
                        <span className="text-[8px] text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">OWNED</span>
                      ) : (
                        <GlowButton
                          size="sm"
                          variant="primary"
                          disabled={player.cash < item.cost}
                          onClick={() => buyStatusItem(item.id)}
                        >
                          Purchase Item
                        </GlowButton>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* GOALS TAB */}
        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Quick overview / info card */}
            <GlassCard hover={false} padding="md" glowColor="cyan">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Financial Planning Goals</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                    Set short and long term targets. Achieving goals rewards you with wealth tokens (<span className="text-yellow-400">★</span>) to unlock features!
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* List of active goals */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Active Goals ({goals.filter(g => !g.isCompleted).length})</p>
              
              {goals.filter(g => !g.isCompleted).length === 0 ? (
                <div className="text-center py-6 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl">
                  <p className="text-xs text-gray-500">No active goals. Pick from templates below or create a custom one!</p>
                </div>
              ) : (
                goals.filter(g => !g.isCompleted).map((goal) => {
                  const monthsLeft = goal.targetMonth - meta.currentMonth;
                  const isOverdue = monthsLeft < 0;

                  return (
                    <GlassCard key={goal.id} padding="sm" hover={false} glowColor="cyan">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base">{goal.icon}</span>
                            <span className="text-xs font-bold text-gray-200">{goal.title}</span>
                            <span className={`text-[8px] px-1 py-0.5 rounded font-mono uppercase font-semibold ${
                              goal.category === 'savings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              goal.category === 'investment' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                              goal.category === 'income' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            }`}>
                              {goal.category}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-gray-400 mt-1">
                            Target: <span className="font-mono text-gray-200">₹{goal.targetAmount.toLocaleString()}</span>
                          </p>

                          <div className="mt-2">
                            <ProgressBar 
                              value={goal.currentProgress * 100} 
                              max={100}
                              color="cyan"
                              size="sm"
                              showPercent
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-[9px] text-gray-500 mt-1.5">
                            <span>Started: Month {goal.startMonth}</span>
                            <span className={isOverdue ? 'text-red-400 font-semibold' : 'text-gray-400'}>
                              {isOverdue ? 'Overdue!' : `${monthsLeft} months left`} (Deadline: Month {goal.targetMonth})
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                            +{goal.reward} <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
                          </span>
                          <button 
                            onClick={() => removeGoal(goal.id)}
                            className="text-[9px] text-red-400 hover:text-red-300 font-semibold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded transition-all active:scale-95"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>

            {/* List of completed goals */}
            {goals.filter(g => g.isCompleted).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Completed Goals ({goals.filter(g => g.isCompleted).length})</p>
                <div className="space-y-1.5">
                  {goals.filter(g => g.isCompleted).map((goal) => (
                    <div key={goal.id} className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span>{goal.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-300 line-through decoration-emerald-500/40">{goal.title}</p>
                          <p className="text-[9px] text-emerald-400/70">Target: ₹{goal.targetAmount.toLocaleString()} • Met</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Goal Templates */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Available Goal Templates</p>
              <div className="grid grid-cols-1 gap-2">
                {GOAL_TEMPLATES.map((tmpl) => {
                  const alreadyActive = goals.some((g) => g.title === tmpl.title);
                  return (
                    <GlassCard 
                      key={tmpl.title}
                      padding="sm"
                      hover={!alreadyActive}
                      glowColor={alreadyActive ? 'none' : 'cyan'}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tmpl.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-200">{tmpl.title}</p>
                            <p className="text-[9px] text-gray-400 leading-normal mt-0.5">
                              Target: <span className="font-mono text-gray-300">₹{tmpl.targetAmount.toLocaleString()}</span> • Deadline: {tmpl.targetMonth} months
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[9px] text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                            +{tmpl.reward} <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
                          </span>

                          {alreadyActive ? (
                            <span className="text-[8px] bg-white/[0.04] text-gray-500 border border-white/[0.06] px-2 py-1 rounded font-semibold uppercase">Active</span>
                          ) : (
                            <GlowButton
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                const newGoal = createGoalFromTemplate(tmpl, meta.currentMonth);
                                addGoal(newGoal);
                              }}
                            >
                              Track Goal
                            </GlowButton>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Custom Goal Form */}
            <div className="space-y-2">
              <GlowButton
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => setShowCustomGoalForm(!showCustomGoalForm)}
              >
                {showCustomGoalForm ? 'Close Custom Goal Creator' : '🎯 Create a Custom Goal'}
              </GlowButton>

              {showCustomGoalForm && (
                <GlassCard hover={false} padding="md" className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Custom Financial Goal</h4>
                  
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Goal Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Save for Down Payment"
                      value={customGoalTitle}
                      onChange={(e) => setCustomGoalTitle(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Target Net Worth (₹)</label>
                      <input 
                        type="number" 
                        value={customGoalTarget}
                        onChange={(e) => setCustomGoalTarget(Number(e.target.value))}
                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-gray-200 font-mono focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-1">Deadline (Months)</label>
                      <input 
                        type="number" 
                        value={customGoalDeadline}
                        onChange={(e) => setCustomGoalDeadline(Number(e.target.value))}
                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-gray-200 font-mono focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-500 leading-normal bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                    Estimated Reward: <span className="text-yellow-400 font-semibold font-mono">+{Math.max(10, Math.round(customGoalTarget / 100000) * 10)} Wealth Tokens</span>. Progress tracks your Net Worth.
                  </p>

                  <GlowButton 
                    variant="primary" 
                    fullWidth
                    disabled={!customGoalTitle.trim() || customGoalTarget <= 0 || customGoalDeadline <= 0}
                    onClick={() => {
                      const cg = createCustomGoal(customGoalTitle, customGoalTarget, meta.currentMonth, customGoalDeadline);
                      addGoal(cg);
                      setCustomGoalTitle('');
                      setShowCustomGoalForm(false);
                    }}
                  >
                    Activate Goal
                  </GlowButton>
                </GlassCard>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
