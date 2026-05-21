'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import AnimatedNumber from '../ui/AnimatedNumber';
import GlowButton from '../ui/GlowButton';
import { formatCurrency } from '../../lib/utils';

export default function MonthSummary() {
  const show = useGameStore((s) => s.ui.showMonthSummary);
  const dismiss = useGameStore((s) => s.dismissMonthSummary);
  const summaries = useGameStore((s) => s.monthSummaries);
  const currentMonth = useGameStore((s) => s.meta.currentMonth);

  const summary = summaries[summaries.length - 1];
  if (!summary) return null;

  const isProfit = summary.netChange >= 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            className="relative w-full max-w-[480px] bg-[#111827] border-t border-x border-white/10 rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto z-10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Month {currentMonth}</h2>
                <p className="text-sm text-gray-400">Monthly Report</p>
              </div>
              <button onClick={dismiss} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Net Change Hero */}
            <motion.div
              className={`
                rounded-2xl p-5 mb-5 text-center
                ${isProfit ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}
              `}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-gray-400 mb-1">Net Change</p>
              <div className="flex items-center justify-center gap-2">
                {isProfit ? (
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                <AnimatedNumber
                  value={summary.netChange}
                  format="currency"
                  size="xl"
                  colorize
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Net Worth: <span className="text-gray-300 font-mono">{formatCurrency(summary.netWorth)}</span>
              </p>
            </motion.div>

            {/* Income & Expenses */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Income */}
              <motion.div
                className="bg-emerald-500/[0.06] border border-emerald-500/10 rounded-xl p-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-emerald-400/70 font-semibold mb-2 uppercase tracking-wider">Income</p>
                <div className="space-y-1.5">
                  {summary.income.salary > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Salary</span>
                      <span className="text-emerald-300 font-mono">{formatCurrency(summary.income.salary)}</span>
                    </div>
                  )}
                  {summary.income.businessProfit > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Business</span>
                      <span className="text-emerald-300 font-mono">{formatCurrency(summary.income.businessProfit)}</span>
                    </div>
                  )}
                  {summary.income.dividends > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Dividends</span>
                      <span className="text-emerald-300 font-mono">{formatCurrency(summary.income.dividends)}</span>
                    </div>
                  )}
                  {summary.income.rentalIncome > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Rental</span>
                      <span className="text-emerald-300 font-mono">{formatCurrency(summary.income.rentalIncome)}</span>
                    </div>
                  )}
                  <div className="border-t border-emerald-500/10 pt-1.5 flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">Total</span>
                    <span className="text-emerald-300 font-mono">{formatCurrency(summary.income.total)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Expenses */}
              <motion.div
                className="bg-red-500/[0.06] border border-red-500/10 rounded-xl p-3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-red-400/70 font-semibold mb-2 uppercase tracking-wider">Expenses</p>
                <div className="space-y-1.5">
                  {summary.expenses.housing > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Housing</span>
                      <span className="text-red-300 font-mono">{formatCurrency(summary.expenses.housing)}</span>
                    </div>
                  )}
                  {summary.expenses.loanEMIs > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Loan EMIs</span>
                      <span className="text-red-300 font-mono">{formatCurrency(summary.expenses.loanEMIs)}</span>
                    </div>
                  )}
                  {summary.expenses.education > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Education</span>
                      <span className="text-red-300 font-mono">{formatCurrency(summary.expenses.education)}</span>
                    </div>
                  )}
                  {summary.expenses.lifestyle > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Lifestyle</span>
                      <span className="text-red-300 font-mono">{formatCurrency(summary.expenses.lifestyle)}</span>
                    </div>
                  )}
                  {summary.expenses.taxes > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Taxes</span>
                      <span className="text-red-300 font-mono">{formatCurrency(summary.expenses.taxes)}</span>
                    </div>
                  )}
                  <div className="border-t border-red-500/10 pt-1.5 flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">Total</span>
                    <span className="text-red-300 font-mono">{formatCurrency(summary.expenses.total)}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Events */}
            {summary.events.length > 0 && (
              <motion.div
                className="mb-5"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Events This Month</p>
                <div className="space-y-2">
                  {summary.events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-start gap-3"
                    >
                      <span className="text-lg">{event.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            <GlowButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={dismiss}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Continue
            </GlowButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
