'use client';

import { useEffect } from 'react';
import { useGameStore } from '../engine/gameStore';
import BottomNav from '../components/layout/BottomNav';
import MonthSummary from '../components/layout/MonthSummary';
import ToastContainer from '../components/ui/Toast';
import NewGameModal from '../components/game/NewGameModal';
import EventModal from '../components/game/EventModal';
import DashboardScreen from '../components/screens/DashboardScreen';
import CareerScreen from '../components/screens/CareerScreen';
import InvestScreen from '../components/screens/InvestScreen';
import BusinessScreen from '../components/screens/BusinessScreen';
import FinanceScreen from '../components/screens/FinanceScreen';
import ProfileScreen from '../components/screens/ProfileScreen';
import { AnimatePresence, motion } from 'framer-motion';

const screens = {
  dashboard: DashboardScreen,
  career: CareerScreen,
  invest: InvestScreen,
  empire: BusinessScreen,
  finance: FinanceScreen,
  profile: ProfileScreen,
} as const;

export default function GameApp() {
  const currentScreen = useGameStore((s) => s.ui.currentScreen);
  const gameStarted = useGameStore((s) => s.meta.gameStarted);
  
  const isPaused = useGameStore((s) => s.meta.isPaused);
  const gameSpeed = useGameStore((s) => s.meta.gameSpeed);
  const tickDaily = useGameStore((s) => s.tickDaily);
  const showMonthSummary = useGameStore((s) => s.ui.showMonthSummary);
  const showEventModal = useGameStore((s) => s.ui.showEventModal);
  const showNewGameModal = useGameStore((s) => s.ui.showNewGameModal);

  // Auto-advancing timeline ticker loop
  useEffect(() => {
    if (!gameStarted || isPaused || showMonthSummary || showEventModal || showNewGameModal) {
      return;
    }

    const tickInterval = Math.max(80, Math.min(2000, 1000 / gameSpeed));
    const timer = setInterval(() => {
      tickDaily();
    }, tickInterval);

    return () => clearInterval(timer);
  }, [gameStarted, isPaused, gameSpeed, tickDaily, showMonthSummary, showEventModal, showNewGameModal]);

  const ScreenComponent = screens[currentScreen] || DashboardScreen;

  return (
    <div className="min-h-dvh bg-[#0D0D0D] text-white relative">
      {/* New Game Modal */}
      <NewGameModal />

      {/* Event Modal */}
      <EventModal />

      {/* Month Summary */}
      <MonthSummary />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Screen Content */}
      {gameStarted && (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ScreenComponent />
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation */}
          <BottomNav />
        </>
      )}
    </div>
  );
}
