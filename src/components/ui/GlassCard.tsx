'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: 'green' | 'blue' | 'gold' | 'red' | 'purple' | 'cyan' | 'none';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const glowMap = {
  green: 'hover:shadow-[0_0_25px_rgba(0,255,178,0.12)]',
  blue: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.12)]',
  gold: 'hover:shadow-[0_0_25px_rgba(255,215,0,0.12)]',
  red: 'hover:shadow-[0_0_25px_rgba(239,68,68,0.12)]',
  purple: 'hover:shadow-[0_0_25px_rgba(139,92,246,0.12)]',
  cyan: 'hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]',
  none: '',
};

const borderGlowMap = {
  green: 'hover:border-emerald-500/30',
  blue: 'hover:border-blue-500/30',
  gold: 'hover:border-yellow-500/30',
  red: 'hover:border-red-500/30',
  purple: 'hover:border-purple-500/30',
  cyan: 'hover:border-cyan-500/30',
  none: 'hover:border-white/10',
};

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export default function GlassCard({
  children,
  className = '',
  onClick,
  glowColor = 'cyan',
  padding = 'md',
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        bg-white/[0.04] backdrop-blur-xl
        border border-white/[0.08] rounded-2xl
        transition-all duration-300
        ${hover ? `cursor-pointer ${glowMap[glowColor]} ${borderGlowMap[glowColor]} hover:bg-white/[0.07]` : ''}
        ${paddingMap[padding]}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
}
