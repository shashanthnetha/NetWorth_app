'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Building2,
  Wallet,
  User,
} from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import { ScreenType } from '../../engine/types';

const tabs: { id: ScreenType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'invest', label: 'Invest', icon: TrendingUp },
  { id: 'empire', label: 'Empire', icon: Building2 },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const currentScreen = useGameStore((s) => s.ui.currentScreen);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="max-w-[480px] mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className={`
                flex flex-col items-center justify-center py-2 px-3 rounded-xl
                transition-colors duration-200 relative min-w-[56px]
                ${isActive ? 'text-emerald-400 font-bold' : 'text-gray-500 hover:text-gray-300'}
              `}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-emerald-500/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-5.5 h-5.5 relative z-10" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-xs mt-1 relative z-10 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[2px] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(0,255,178,0.6)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
