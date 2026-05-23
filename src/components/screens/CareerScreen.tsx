'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  ChevronRight, 
  Lock, 
  Check, 
  BookOpen, 
  Star, 
  Zap, 
  Users, 
  Laptop, 
  Video, 
  Award,
  CircleDollarSign,
  Info
} from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import { JOBS, EDUCATION_COURSES } from '../../engine/gameData';
import { SIDE_HUSTLES } from '../../engine/sideHustleData';
import { NETWORKING_EVENTS } from '../../engine/networkingData';
import { formatCurrency } from '../../lib/utils';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import ProgressBar from '../ui/ProgressBar';
import { SkillType } from '../../engine/types';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function CareerScreen() {
  const player = useGameStore((s) => s.player);
  const sideHustles = useGameStore((s) => s.sideHustles);
  const applyForJob = useGameStore((s) => s.applyForJob);
  const quitJob = useGameStore((s) => s.quitJob);
  const enrollEducation = useGameStore((s) => s.enrollEducation);
  const dropEducation = useGameStore((s) => s.dropEducation);
  const startSideHustle = useGameStore((s) => s.startSideHustle);
  const stopSideHustle = useGameStore((s) => s.stopSideHustle);
  const attendNetworkingEvent = useGameStore((s) => s.attendNetworkingEvent);

  const [tab, setTab] = useState<'jobs' | 'education' | 'hustles' | 'networking'>('jobs');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const currentJob = player.currentJob
    ? JOBS.find((j) => j.id === player.currentJob!.jobId)
    : null;

  const canApply = (jobId: string) => {
    const job = JOBS.find((j) => j.id === jobId);
    if (!job) return false;
    for (const eduId of job.requirements.education) {
      if (!player.completedEducation.includes(eduId)) return false;
    }
    for (const [skill, level] of Object.entries(job.requirements.skills)) {
      if ((player.skills[skill as SkillType] || 0) < (level || 0)) return false;
    }
    if (player.experience < job.requirements.experience) return false;
    return true;
  };

  const canEnroll = (eduId: string) => {
    const edu = EDUCATION_COURSES.find((e) => e.id === eduId);
    if (!edu) return false;
    if (player.completedEducation.includes(eduId)) return false;
    if (player.activeEducation) return false;
    for (const prereq of edu.prerequisites) {
      if (!player.completedEducation.includes(prereq)) return false;
    }
    if (player.cash < edu.costPerMonth) return false;
    return true;
  };

  const isHustleActive = (hustleId: string) => sideHustles.some((sh) => sh.hustleId === hustleId);

  const canStartHustle = (hustle: typeof SIDE_HUSTLES[0]) => {
    if (isHustleActive(hustle.id)) return false;
    if (hustle.requirements) {
      if (hustle.requirements.skills) {
        for (const [skill, val] of Object.entries(hustle.requirements.skills)) {
          if ((player.skills[skill as SkillType] || 0) < (val as number)) return false;
        }
      }
      if (hustle.requirements.reputation && player.stats.reputation < hustle.requirements.reputation) {
        return false;
      }
      if (hustle.requirements.experience && player.experience < hustle.requirements.experience) {
        return false;
      }
    }
    return true;
  };

  const canAttendEvent = (event: typeof NETWORKING_EVENTS[0]) => {
    if (player.cash < event.cost) return false;
    if (player.stats.reputation < event.reputationRequired) return false;
    return true;
  };

  return (
    <motion.div className="page-container" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-4">
        <h1 className="font-heading text-2xl font-extrabold text-gray-100">Career & Connection</h1>
        <p className="text-xs text-gray-500">Build your skills, run side gigs, and network with elites</p>
      </motion.div>

      {/* Current Job & Active Education Panel (Sticky at top when active) */}
      {(currentJob || player.activeEducation) && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {currentJob && (
            <GlassCard hover={false} glowColor="cyan" padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{currentJob.title}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(currentJob.salary)}/month</p>
                  </div>
                </div>
                <GlowButton variant="danger" size="sm" onClick={quitJob}>Quit</GlowButton>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.02]">
                  <p className="text-[10px] text-gray-500 font-medium">Stress</p>
                  <p className="text-sm font-mono font-bold text-orange-400">{currentJob.stressLevel}%</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.02]">
                  <p className="text-[10px] text-gray-500 font-medium">Hours/wk</p>
                  <p className="text-sm font-mono font-bold text-gray-300">{currentJob.workHours}h</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.02]">
                  <p className="text-[10px] text-gray-500 font-medium">XP/mo</p>
                  <p className="text-sm font-mono font-bold text-purple-400">+{currentJob.experienceGain}</p>
                </div>
              </div>
              <ProgressBar value={player.currentJob!.performance} label="Performance" showPercent color="cyan" size="sm" />
            </GlassCard>
          )}

          {player.activeEducation && (
            <GlassCard hover={false} glowColor="purple" padding="md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  <p className="text-sm font-semibold text-gray-200">
                    Currently Studying
                  </p>
                </div>
                <GlowButton variant="danger" size="sm" onClick={dropEducation}>Drop</GlowButton>
              </div>
              <ProgressBar
                value={player.activeEducation.monthsCompleted}
                max={player.activeEducation.totalMonths}
                label={player.activeEducation.educationId.replace(/_/g, ' ')}
                sublabel={`${player.activeEducation.monthsCompleted}/${player.activeEducation.totalMonths} months`}
                showPercent
                color="purple"
              />
            </GlassCard>
          )}
        </motion.div>
      )}

      {/* Skills Showcase */}
      <motion.div variants={fadeUp} className="mb-4">
        <GlassCard hover={false} padding="sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2 px-1">Professional Skills</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(player.skills).map(([skill, level]) => (
              <div key={skill} className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500/50" />
                <ProgressBar
                  value={level}
                  max={10}
                  label={skill.charAt(0).toUpperCase() + skill.slice(1)}
                  color="gold"
                  size="sm"
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-1.5 mb-4 bg-white/[0.02] p-1.5 rounded-xl border border-white/[0.04]">
        {[
          { id: 'jobs', label: 'Jobs', icon: Briefcase, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' },
          { id: 'education', label: 'Study', icon: GraduationCap, color: 'text-purple-400', activeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/20' },
          { id: 'hustles', label: 'Hustles', icon: Zap, color: 'text-amber-400', activeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
          { id: 'networking', label: 'Network', icon: Users, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-sm font-bold transition-all border cursor-pointer ${
                isActive 
                  ? t.activeBg 
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? t.color : 'text-gray-500'}`} />
              {t.label}
            </button>
          );
        })}
      </motion.div>

      {/* Job List Tab */}
      {tab === 'jobs' && (
        <motion.div className="space-y-4" variants={stagger} initial="hidden" animate="show">
          {(['entry', 'mid', 'high'] as const).map((tier) => (
            <motion.div key={tier} variants={fadeUp} className="space-y-2">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider px-1">
                {tier === 'entry' ? '🟢 Entry Level' : tier === 'mid' ? '🔵 Mid Level' : '👑 High Level'}
              </p>
              <div className="space-y-2">
                {JOBS.filter((j) => j.tier === tier).map((job) => {
                  const isCurrentJob = player.currentJob?.jobId === job.id;
                  const available = canApply(job.id);
                  return (
                    <GlassCard
                      key={job.id}
                      padding="sm"
                      glowColor={isCurrentJob ? 'cyan' : available ? 'green' : 'none'}
                      hover={available && !isCurrentJob}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-200 truncate">{job.title}</p>
                            {isCurrentJob && (
                              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-md font-semibold border border-cyan-500/30">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatCurrency(job.salary)}/mo • Stress: <span className="font-mono">{job.stressLevel}%</span>
                          </p>
                        </div>
                        {isCurrentJob ? (
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-cyan-400" />
                          </div>
                        ) : available ? (
                          <GlowButton size="sm" variant="primary" onClick={() => applyForJob(job.id)}>Apply</GlowButton>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Education List Tab */}
      {tab === 'education' && (
        <motion.div className="space-y-4" variants={stagger} initial="hidden" animate="show">
          {(['course', 'degree', 'elite'] as const).map((tier) => (
            <motion.div key={tier} variants={fadeUp} className="space-y-2">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider px-1">
                {tier === 'course' ? '📘 Courses' : tier === 'degree' ? '🎓 Degrees' : '🏆 Elite Specializations'}
              </p>
              <div className="space-y-2">
                {EDUCATION_COURSES.filter((e) => e.tier === tier).map((edu) => {
                  const completed = player.completedEducation.includes(edu.id);
                  const available = canEnroll(edu.id);
                  return (
                    <GlassCard
                      key={edu.id}
                      padding="sm"
                      glowColor={completed ? 'green' : available ? 'purple' : 'none'}
                      hover={available}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-200 truncate">{edu.name}</p>
                            {completed && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-500/30">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatCurrency(edu.costPerMonth)}/mo • {edu.duration} mo • Salary: <span className="text-emerald-400 font-semibold">+{Math.round((edu.salaryMultiplier - 1) * 100)}%</span>
                          </p>
                        </div>
                        {completed ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-400" />
                          </div>
                        ) : available ? (
                          <GlowButton size="sm" variant="secondary" onClick={() => enrollEducation(edu.id)}>Enroll</GlowButton>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Side Hustles Tab */}
      {tab === 'hustles' && (
        <motion.div className="space-y-4" variants={stagger} initial="hidden" animate="show">
          {/* Active Side Hustles Overview */}
          {sideHustles.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-2">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-1">Active Side Hustles</p>
              <div className="space-y-2">
                {sideHustles.map((sh) => {
                  const template = SIDE_HUSTLES.find((t) => t.id === sh.hustleId);
                  if (!template) return null;
                  return (
                    <GlassCard key={sh.hustleId} glowColor="gold" padding="md" hover={false}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{template.icon}</span>
                          <div>
                            <h3 className="text-sm font-bold text-gray-200">{template.name}</h3>
                            <p className="text-xs text-gray-500">Active for {sh.monthsActive} months</p>
                          </div>
                        </div>
                        <GlowButton variant="danger" size="sm" onClick={() => stopSideHustle(sh.hustleId)}>Stop</GlowButton>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                        <div>
                          <p className="text-gray-500">Income/mo</p>
                          <p className="font-mono font-bold text-emerald-400">+{formatCurrency(sh.currentIncome)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Energy Cost</p>
                          <p className="font-mono font-bold text-orange-400">-{template.energyCost}⚡</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Earned</p>
                          <p className="font-mono font-bold text-gray-300">{formatCurrency(sh.totalEarned)}</p>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Hustles Marketplace */}
          <motion.div variants={fadeUp} className="space-y-2">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-1">Hustle Marketplace</p>
            <div className="space-y-3">
              {(['freelance', 'content', 'gig', 'consulting'] as const).map((type) => {
                const categoryHustles = SIDE_HUSTLES.filter((h) => h.type === type);
                if (categoryHustles.length === 0) return null;
                return (
                  <div key={type} className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider px-1">
                      {type === 'freelance' ? '💼 Freelance Gigs' : type === 'content' ? '🎥 Content Creation' : type === 'gig' ? '🛵 Gig Economy' : '🏛️ Elite Consulting'}
                    </p>
                    <div className="space-y-2">
                      {categoryHustles.map((hustle) => {
                        const active = isHustleActive(hustle.id);
                        const available = canStartHustle(hustle);
                        return (
                          <GlassCard
                            key={hustle.id}
                            padding="sm"
                            glowColor={active ? 'gold' : available ? 'cyan' : 'none'}
                            hover={available && !active}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{hustle.icon}</span>
                                  <p className="text-sm font-semibold text-gray-200 truncate">{hustle.name}</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{hustle.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]">
                                  <span className="text-emerald-400 font-mono">
                                    Est. Income: {formatCurrency(hustle.baseIncome)}/mo
                                  </span>
                                  <span className="text-orange-400 font-mono">
                                    Energy: -{hustle.energyCost}⚡
                                  </span>
                                  <span className="text-gray-500 font-mono">
                                    Time: {hustle.hoursPerWeek}h/wk
                                  </span>
                                </div>

                                {/* Requirements block */}
                                {hustle.requirements && !active && !available && (
                                  <div className="mt-2 p-1.5 rounded bg-red-500/5 border border-red-500/10 text-[10px] text-red-400/90 flex flex-wrap gap-x-2 gap-y-0.5">
                                    <span className="font-semibold">Locked:</span>
                                    {hustle.requirements.skills && Object.entries(hustle.requirements.skills).map(([skill, val]) => (
                                      <span key={skill} className={player.skills[skill as SkillType] >= val ? "text-emerald-500" : ""}>
                                        {skill} Lvl {val}
                                      </span>
                                    ))}
                                    {hustle.requirements.reputation && (
                                      <span className={player.stats.reputation >= hustle.requirements.reputation ? "text-emerald-500" : ""}>
                                        Rep {hustle.requirements.reputation}
                                      </span>
                                    )}
                                    {hustle.requirements.experience && (
                                      <span className={player.experience >= hustle.requirements.experience ? "text-emerald-500" : ""}>
                                        XP {hustle.requirements.experience}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {active ? (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-semibold border border-amber-500/30">
                                  Running
                                </span>
                              ) : available ? (
                                <GlowButton size="sm" variant="secondary" onClick={() => startSideHustle(hustle.id)}>Start</GlowButton>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                                  <Lock className="w-3.5 h-3.5 text-gray-600" />
                                </div>
                              )}
                            </div>
                          </GlassCard>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Networking Tab */}
      {tab === 'networking' && (
        <motion.div className="space-y-4" variants={stagger} initial="hidden" animate="show">
          {/* Reputation Stats Panel */}
          <motion.div variants={fadeUp}>
            <GlassCard hover={false} glowColor="green" padding="md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-200">Social Reputation</h3>
                    <p className="text-xs text-gray-500">Unlocks VIP job offers & start-up networks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold text-emerald-400">{player.stats.reputation}/100</p>
                </div>
              </div>
              <ProgressBar value={player.stats.reputation} max={100} color="green" size="sm" />
            </GlassCard>
          </motion.div>

          {/* Events List */}
          <motion.div variants={fadeUp} className="space-y-2">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-1">Networking Events</p>
            <div className="space-y-3">
              {NETWORKING_EVENTS.map((event) => {
                const available = canAttendEvent(event);
                const isSelected = selectedEventId === event.id;
                
                return (
                  <GlassCard
                    key={event.id}
                    padding="sm"
                    glowColor={isSelected ? 'green' : available ? 'cyan' : 'none'}
                    className="overflow-hidden transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{event.icon}</span>
                          <p className="text-sm font-semibold text-gray-200 truncate">{event.name}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]">
                          <span className="text-emerald-400 font-mono font-semibold">
                            Cost: {formatCurrency(event.cost)}
                          </span>
                          <span className="text-purple-400 font-semibold font-mono">
                            Base Gain: +{event.reputationGain} Rep
                          </span>
                          <span className="text-gray-500 font-mono">
                            Requires: {event.reputationRequired} Rep
                          </span>
                        </div>

                        {/* Expandable Outcomes List */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5"
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 mb-1 font-semibold">
                                <Info className="w-3.5 h-3.5" />
                                Potential Outcomes & Probabilities:
                              </div>
                              {event.outcomes.map((out, idx) => (
                                <div key={idx} className="flex justify-between text-[10px] text-gray-400 bg-white/[0.01] p-1 rounded border border-white/[0.02]">
                                  <span>{out.label}</span>
                                  <span className="font-mono text-gray-500 font-semibold">{Math.round(out.probability * 100)}%</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch gap-2">
                        {available ? (
                          <GlowButton size="sm" variant="primary" onClick={() => attendNetworkingEvent(event.id)}>
                            Attend
                          </GlowButton>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-gray-600" />
                          </div>
                        )}
                        <button 
                          onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                          className="text-[10px] text-gray-500 hover:text-gray-300 underline underline-offset-2"
                        >
                          {isSelected ? 'Hide Odds' : 'View Odds'}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
