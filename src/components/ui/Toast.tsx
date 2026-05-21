'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, TrendingUp, TrendingDown, Info, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';

const iconMap = {
  success: <TrendingUp className="w-4 h-4" />,
  error: <TrendingDown className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  achievement: <Trophy className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
};

const colorMap = {
  success: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    icon: 'text-emerald-400',
  },
  error: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    text: 'text-red-300',
    icon: 'text-red-400',
  },
  info: {
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    icon: 'text-blue-400',
  },
  achievement: {
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    icon: 'text-yellow-400',
  },
  warning: {
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    text: 'text-orange-300',
    icon: 'text-orange-400',
  },
};

export default function ToastContainer() {
  const toasts = useGameStore((s) => s.toasts);
  const removeToast = useGameStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[320px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const colors = colorMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`
                ${colors.bg} ${colors.border}
                border backdrop-blur-xl rounded-xl p-3
                flex items-start gap-3 cursor-pointer
              `}
              onClick={() => removeToast(toast.id)}
            >
              <span className={`${colors.icon} mt-0.5 flex-shrink-0`}>
                {iconMap[toast.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${colors.text}`}>{toast.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{toast.message}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
