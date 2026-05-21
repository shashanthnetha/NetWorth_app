'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface MiniChartProps {
  data: number[];
  color?: 'green' | 'blue' | 'red' | 'cyan' | 'purple';
  height?: number;
  className?: string;
  showGradient?: boolean;
}

const colorPalette = {
  green: { stroke: '#10B981', fill: '#10B981' },
  blue: { stroke: '#3B82F6', fill: '#3B82F6' },
  red: { stroke: '#EF4444', fill: '#EF4444' },
  cyan: { stroke: '#22D3EE', fill: '#22D3EE' },
  purple: { stroke: '#8B5CF6', fill: '#8B5CF6' },
};

export default function MiniChart({
  data,
  color = 'green',
  height = 48,
  className = '',
  showGradient = true,
}: MiniChartProps) {
  const chartData = useMemo(
    () => data.map((value, index) => ({ index, value })),
    [data]
  );

  const palette = colorPalette[color];
  const gradientId = `mini-gradient-${color}-${Math.random().toString(36).substring(7)}`;

  // Determine trend color
  const isPositive = data.length >= 2 && data[data.length - 1] >= data[0];
  const trendColor = isPositive ? colorPalette.green : colorPalette.red;
  const activeColor = showGradient ? palette : trendColor;

  if (data.length < 2) {
    return <div className={`h-${height / 4} ${className}`} />;
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor.fill} stopOpacity={0.3} />
              <stop offset="100%" stopColor={activeColor.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={activeColor.stroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
