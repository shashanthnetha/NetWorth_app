'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { formatCurrency, formatCurrencyFull, formatPercent } from '../../lib/utils';

interface AnimatedNumberProps {
  value: number;
  previousValue?: number;
  format?: 'currency' | 'currencyFull' | 'percent' | 'plain' | 'compact';
  className?: string;
  showChange?: boolean;
  duration?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  colorize?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
  hero: 'text-4xl md:text-5xl',
};

export default function AnimatedNumber({
  value,
  previousValue,
  format = 'currency',
  className = '',
  showChange = false,
  duration = 0.8,
  size = 'md',
  colorize = false,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(previousValue ?? value);
  const spring = useSpring(previousValue ?? value, {
    stiffness: 80,
    damping: 20,
    duration: duration * 1000,
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [spring]);

  const formatValue = (v: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(v);
      case 'currencyFull':
        return formatCurrencyFull(v);
      case 'percent':
        return formatPercent(v);
      case 'compact':
        return formatCurrency(v, true);
      case 'plain':
        return Math.round(v).toLocaleString('en-IN');
      default:
        return v.toString();
    }
  };

  const change = previousValue !== undefined ? value - previousValue : 0;
  const changeColor = change > 0
    ? 'text-emerald-400'
    : change < 0
      ? 'text-red-400'
      : 'text-gray-500';
  const changeGlow = change > 0
    ? 'neon-green'
    : change < 0
      ? 'neon-red'
      : '';

  const valueColor = colorize
    ? value > 0
      ? 'text-emerald-400'
      : value < 0
        ? 'text-red-400'
        : 'text-gray-400'
    : '';

  return (
    <div className={`font-mono inline-flex flex-col ${className}`}>
      <motion.span
        className={`${sizeClasses[size]} font-bold tracking-tight ${valueColor}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {formatValue(displayValue)}
      </motion.span>

      {showChange && previousValue !== undefined && change !== 0 && (
        <motion.span
          className={`text-xs font-medium ${changeColor} ${changeGlow} mt-0.5`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {change > 0 ? '+' : ''}{formatCurrency(change)}
        </motion.span>
      )}
    </div>
  );
}
