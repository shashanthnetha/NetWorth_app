'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'premium' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantStyles = {
  primary: {
    bg: 'bg-emerald-500/20 hover:bg-emerald-500/30',
    border: 'border border-emerald-500/40 hover:border-emerald-400/60',
    text: 'text-emerald-300',
    glow: 'hover:shadow-[0_0_30px_rgba(0,255,178,0.2)]',
  },
  secondary: {
    bg: 'bg-blue-500/15 hover:bg-blue-500/25',
    border: 'border border-blue-500/30 hover:border-blue-400/50',
    text: 'text-blue-300',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
  },
  danger: {
    bg: 'bg-red-500/15 hover:bg-red-500/25',
    border: 'border border-red-500/30 hover:border-red-400/50',
    text: 'text-red-300',
    glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
  },
  premium: {
    bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30',
    border: 'border border-yellow-500/40 hover:border-yellow-400/60',
    text: 'text-yellow-300',
    glow: 'hover:shadow-[0_0_30px_rgba(255,215,0,0.2)]',
  },
  ghost: {
    bg: 'bg-white/[0.04] hover:bg-white/[0.08]',
    border: 'border border-white/[0.08] hover:border-white/[0.15]',
    text: 'text-gray-300',
    glow: '',
  },
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
};

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  icon,
}: GlowButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200
        ${styles.bg} ${styles.border} ${styles.text} ${styles.glow}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed !shadow-none' : 'cursor-pointer'}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      disabled={disabled}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
