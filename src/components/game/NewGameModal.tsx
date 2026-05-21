'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Crown, Shield, Zap } from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import GlowButton from '../ui/GlowButton';

const difficulties = [
  {
    id: 'easy' as const,
    label: 'Comfortable',
    description: 'Start with ₹25,000 and better credit. For casual players.',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'normal' as const,
    label: 'Standard',
    description: 'Start with ₹5,000. The classic NetWorth experience.',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'hard' as const,
    label: 'Survival',
    description: 'Start with ₹2,000 and bad credit. For veterans only.',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
];

export default function NewGameModal() {
  const show = useGameStore((s) => s.ui.showNewGameModal);
  const startNewGame = useGameStore((s) => s.startNewGame);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  if (!show) return null;

  const handleStart = () => {
    if (name.trim().length < 2) return;
    startNewGame(name.trim(), difficulty);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        {/* Content */}
        <motion.div
          className="relative w-full max-w-[420px]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Logo */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-6"
                animate={{ boxShadow: ['0 0 30px rgba(0,255,178,0.1)', '0 0 60px rgba(0,255,178,0.2)', '0 0 30px rgba(0,255,178,0.1)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <h1 className="font-heading text-4xl font-extrabold mb-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                NETWORTH
              </h1>
              <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                Build your financial empire from nothing. Every decision counts.
              </p>

              <GlowButton
                variant="primary"
                size="xl"
                onClick={() => setStep(1)}
                icon={<ChevronRight className="w-5 h-5" />}
              >
                Start Your Journey
              </GlowButton>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-6"
            >
              <h2 className="font-heading text-xl font-bold mb-1">What&apos;s your name?</h2>
              <p className="text-sm text-gray-500 mb-5">This will be your identity in the game.</p>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                autoFocus
                maxLength={20}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-lg font-medium placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim().length >= 2) setStep(2);
                }}
              />

              <div className="flex gap-3 mt-5">
                <GlowButton variant="ghost" onClick={() => setStep(0)} className="flex-1">
                  Back
                </GlowButton>
                <GlowButton
                  variant="primary"
                  onClick={() => setStep(2)}
                  disabled={name.trim().length < 2}
                  className="flex-1"
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </GlowButton>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-6"
            >
              <h2 className="font-heading text-xl font-bold mb-1">Choose Difficulty</h2>
              <p className="text-sm text-gray-500 mb-4">How tough do you want it?</p>

              <div className="space-y-3 mb-5">
                {difficulties.map((d) => (
                  <motion.button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all
                      ${difficulty === d.id
                        ? d.bg
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                      }
                    `}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={d.color}>{d.icon}</span>
                      <div>
                        <p className={`font-semibold text-sm ${difficulty === d.id ? d.color : 'text-gray-300'}`}>
                          {d.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <GlowButton variant="ghost" onClick={() => setStep(1)} className="flex-1">
                  Back
                </GlowButton>
                <GlowButton
                  variant="primary"
                  onClick={handleStart}
                  className="flex-1"
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Begin
                </GlowButton>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
