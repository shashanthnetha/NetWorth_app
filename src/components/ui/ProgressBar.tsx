'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;         // 0-100
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'green' | 'blue' | 'gold' | 'red' | 'purple' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
  className?: string;
  animated?: boolean;
}

const colorMap = {
  green: {
    bar: 'from-emerald-400 to-emerald-500',
    glow: 'shadow-[0_0_8px_rgba(0,255,178,0.4)]',
    bg: 'bg-emerald-500/10',
  },
  blue: {
    bar: 'from-blue-400 to-blue-500',
    glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    bg: 'bg-blue-500/10',
  },
  gold: {
    bar: 'from-yellow-400 to-amber-500',
    glow: 'shadow-[0_0_8px_rgba(255,215,0,0.4)]',
    bg: 'bg-yellow-500/10',
  },
  red: {
    bar: 'from-red-400 to-red-500',
    glow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    bg: 'bg-red-500/10',
  },
  purple: {
    bar: 'from-purple-400 to-purple-500',
    glow: 'shadow-[0_0_8px_rgba(139,92,246,0.4)]',
    bg: 'bg-purple-500/10',
  },
  cyan: {
    bar: 'from-cyan-400 to-cyan-500',
    glow: 'shadow-[0_0_8px_rgba(34,211,238,0.4)]',
    bg: 'bg-cyan-500/10',
  },
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = 'green',
  size = 'md',
  showPercent = false,
  className = '',
  animated = true,
}: ProgressBarProps) {
  const percent = Math.min(100, (value / max) * 100);
  const colors = colorMap[color];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400 font-medium">{label}</span>
          <div className="flex items-center gap-2">
            {sublabel && <span className="text-xs text-gray-500">{sublabel}</span>}
            {showPercent && (
              <span className="text-xs font-mono text-gray-300">{Math.round(percent)}%</span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full ${colors.bg} rounded-full ${sizeMap[size]} overflow-hidden`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colors.bar} rounded-full ${colors.glow}`}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
