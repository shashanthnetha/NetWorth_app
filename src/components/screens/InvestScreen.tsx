'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Clock,
  Lock,
  Percent,
  Coins,
  AlertCircle,
  TrendingUp as TrendUpIcon
} from 'lucide-react';
import { useGameStore } from '../../engine/gameStore';
import { calculatePortfolioValue, calculatePortfolioGainLoss } from '../../engine/marketEngine';
import { formatCurrency, formatPercent } from '../../lib/utils';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import AnimatedNumber from '../ui/AnimatedNumber';
import MiniChart from '../ui/MiniChart';
import { ForexPair, ForexPosition } from '../../engine/types';
import { calculateForexPnL } from '../../engine/forexData';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function InvestScreen() {
  const player = useGameStore((s) => s.player);
  const market = useGameStore((s) => s.market);
  const currentMonth = useGameStore((s) => s.meta.currentMonth);
  
  // Stock Actions
  const buyStock = useGameStore((s) => s.buyStock);
  const sellStock = useGameStore((s) => s.sellStock);
  
  // Crypto Actions
  const buyCrypto = useGameStore((s) => s.buyCrypto);
  const sellCrypto = useGameStore((s) => s.sellCrypto);
  
  // Mutual Fund Actions
  const buyMutualFund = useGameStore((s) => s.buyMutualFund);
  const sellMutualFund = useGameStore((s) => s.sellMutualFund);
  const startSIP = useGameStore((s) => s.startSIP);
  const stopSIP = useGameStore((s) => s.stopSIP);

  // Commodity Actions
  const buyCommodity = useGameStore((s) => s.buyCommodity);
  const sellCommodity = useGameStore((s) => s.sellCommodity);

  // Forex Actions
  const openForexPosition = useGameStore((s) => s.openForexPosition);
  const closeForexPosition = useGameStore((s) => s.closeForexPosition);

  // Navigation tabs
  const [tab, setTab] = useState<'stocks' | 'crypto' | 'mutual_funds' | 'commodities' | 'forex'>('stocks');

  // Stock trading states
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockAmount, setStockAmount] = useState(1);

  // Mutual fund states
  const [selectedMF, setSelectedMF] = useState<string | null>(null);
  const [mfAmount, setMfAmount] = useState(5000);
  const [mfInvestType, setMfInvestType] = useState<'lumpsum' | 'sip'>('lumpsum');

  // Commodity states
  const [selectedComm, setSelectedComm] = useState<string | null>(null);
  const [commAmount, setCommAmount] = useState(1); // in grams

  // Forex states
  const [selectedPair, setSelectedPair] = useState<ForexPair | null>(null);
  const [forexType, setForexType] = useState<'long' | 'short'>('long');
  const [forexLotSize, setForexLotSize] = useState(10000);
  const [forexLeverage, setForexLeverage] = useState<10 | 20 | 30 | 50>(10);
  const [forexSL, setForexSL] = useState<string>('');
  const [forexTP, setForexTP] = useState<string>('');

  const state = { market } as Parameters<typeof calculatePortfolioValue>[0];
  const portfolioValue = calculatePortfolioValue(state);
  const portfolioGL = calculatePortfolioGainLoss(state);

  // Selected details
  const selectedCompany = selectedStock ? market.companies.find((c) => c.id === selectedStock) : null;
  const selectedStockHolding = selectedStock ? market.holdings.find((h) => h.companyId === selectedStock) : null;

  const selectedFund = selectedMF ? market.mutualFunds.find((f) => f.id === selectedMF) : null;
  const selectedMFHolding = selectedMF ? market.mutualFundHoldings.find((h) => h.fundId === selectedMF) : null;

  const selectedCommodity = selectedComm ? market.commodities.find((c) => c.id === selectedComm) : null;
  const selectedCommHolding = selectedComm ? market.commodityHoldings.find((h) => h.commodityId === selectedComm) : null;

  const selectedForexPairData = selectedPair ? market.forexPairs.find((p) => p.id === selectedPair) : null;

  // Calculators
  const calcForexMargin = () => {
    if (!selectedForexPairData) return 0;
    return Math.round((forexLotSize * selectedForexPairData.currentRate) / forexLeverage);
  };

  return (
    <motion.div className="page-container pb-24" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-4">
        <h1 className="font-heading text-xl font-bold">Investments</h1>
        <p className="text-xs text-gray-500">Deploy capital and secure your financial future</p>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div variants={fadeUp} className="mb-4">
        <GlassCard hover={false} glowColor={portfolioGL.gainLoss >= 0 ? 'green' : 'red'} padding="md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Portfolio Value</p>
              <AnimatedNumber value={portfolioValue} format="currency" size="lg" />
            </div>
            {portfolioGL.totalInvested > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Return</p>
                <p className={`text-sm font-mono font-bold ${portfolioGL.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercent(portfolioGL.gainLossPercent)}
                </p>
                <p className={`text-xs font-mono ${portfolioGL.gainLoss >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                  {portfolioGL.gainLoss >= 0 ? '+' : ''}{formatCurrency(portfolioGL.gainLoss)}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>Cash: <span className="text-gray-300 font-mono">{formatCurrency(player.cash)}</span></span>
            <span>•</span>
            <span>Market: <span className={`font-mono ${
              market.marketTrend === 'bull' ? 'text-emerald-400' : market.marketTrend === 'bear' ? 'text-red-400' : 'text-gray-400'
            }`}>{market.marketTrend === 'bull' ? '📈 Bull' : market.marketTrend === 'bear' ? '📉 Bear' : '➡️ Neutral'}</span></span>
          </div>
        </GlassCard>
      </motion.div>

      {/* Horizontal Scroll Tab Selector */}
      <motion.div variants={fadeUp} className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 mb-4">
        {(['stocks', 'crypto', 'mutual_funds', 'commodities', 'forex'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setSelectedStock(null);
              setSelectedMF(null);
              setSelectedComm(null);
              setSelectedPair(null);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              tab === t
                ? t === 'stocks'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                  : t === 'crypto'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[0_0_8px_rgba(139,92,246,0.15)]'
                  : t === 'mutual_funds'
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                  : t === 'commodities'
                  ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.15)]'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                : 'bg-white/[0.02] text-gray-500 border-white/[0.04] hover:text-gray-300'
            }`}
          >
            {t === 'stocks' && '📈 Stocks'}
            {t === 'crypto' && '🪙 Crypto'}
            {t === 'mutual_funds' && '🏦 Mutual Funds'}
            {t === 'commodities' && '🔱 Commodities'}
            {t === 'forex' && '💱 Forex'}
          </button>
        ))}
      </motion.div>

      {/* ========================================================
          STOCKS SECTION
         ======================================================== */}
      {tab === 'stocks' && (
        <div className="space-y-3">
          {selectedCompany && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard hover={false} glowColor="blue" padding="md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-200">{selectedCompany.name}</p>
                    <p className="text-xs text-gray-500">{selectedCompany.ticker} • {selectedCompany.sector}</p>
                  </div>
                  <button onClick={() => setSelectedStock(null)} className="text-gray-500 text-xs hover:text-gray-300">✕</button>
                </div>
                <MiniChart data={selectedCompany.priceHistory} height={60} color="blue" className="mb-3" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Current Price</span>
                  <span className="font-mono text-sm text-gray-200">{formatCurrency(selectedCompany.currentPrice, false)}</span>
                </div>
                {selectedStockHolding && (
                  <div className="flex items-center justify-between mb-3 text-xs border-t border-white/[0.04] pt-2">
                    <span className="text-gray-400">You Own</span>
                    <span className="font-mono text-gray-200">
                      {selectedStockHolding.shares} shares ({formatCurrency(selectedStockHolding.shares * selectedCompany.currentPrice)})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setStockAmount(Math.max(1, stockAmount - 1))}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={stockAmount}
                    onChange={(e) => setStockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center bg-white/[0.04] border border-white/[0.08] rounded-lg py-2 font-mono text-sm focus:outline-none focus:border-blue-500/40"
                  />
                  <button
                    onClick={() => setStockAmount(stockAmount + 1)}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mb-3 font-mono">
                  Total Order Value: <span className="text-gray-300">{formatCurrency(selectedCompany.currentPrice * stockAmount, false)}</span>
                </p>
                <div className="flex gap-2">
                  <GlowButton
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={() => { buyStock(selectedStock!, stockAmount); setStockAmount(1); }}
                    disabled={player.cash < selectedCompany.currentPrice * stockAmount}
                    icon={<ArrowUpRight className="w-4 h-4" />}
                  >
                    Buy shares
                  </GlowButton>
                  <GlowButton
                    variant="danger"
                    size="md"
                    className="flex-1"
                    onClick={() => { sellStock(selectedStock!, stockAmount); setStockAmount(1); }}
                    disabled={!selectedStockHolding || selectedStockHolding.shares < stockAmount}
                    icon={<ArrowDownRight className="w-4 h-4" />}
                  >
                    Sell shares
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          <div className="space-y-2">
            {market.companies.map((company) => {
              const holding = market.holdings.find((h) => h.companyId === company.id);
              const prevPrice = company.priceHistory.length > 1 ? company.priceHistory[company.priceHistory.length - 2] : company.currentPrice;
              const change = ((company.currentPrice - prevPrice) / prevPrice) * 100;
              const isSelected = selectedStock === company.id;

              return (
                <motion.div key={company.id} variants={fadeUp}>
                  <GlassCard
                    padding="sm"
                    glowColor={isSelected ? 'blue' : change >= 0 ? 'green' : 'red'}
                    onClick={() => { setSelectedStock(company.id); setStockAmount(1); }}
                    className={isSelected ? '!border-blue-500/30' : ''}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 flex-shrink-0">
                          <MiniChart data={company.priceHistory.slice(-12)} height={40} color={change >= 0 ? 'green' : 'red'} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-200">{company.ticker}</p>
                            {holding && (
                              <span className="text-[9px] bg-blue-500/15 text-blue-300 px-1 py-0.5 rounded font-mono">{holding.shares}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">{company.name}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono font-bold text-gray-200">{formatCurrency(company.currentPrice, false)}</p>
                        <p className={`text-[10px] font-mono flex items-center justify-end gap-0.5 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatPercent(change)}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          CRYPTO SECTION
         ======================================================== */}
      {tab === 'crypto' && (
        <div className="space-y-3">
          <motion.div variants={fadeUp}>
            <div className="bg-orange-500/10 border border-orange-500/15 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-300 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> High Market Risk
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Cryptocurrencies are highly volatile. Leverage strict risk management.</p>
            </div>
          </motion.div>

          <div className="space-y-2">
            {market.cryptoAssets.map((crypto) => {
              const holding = market.cryptoHoldings.find((h) => h.cryptoId === crypto.id);
              const prevPrice = crypto.priceHistory.length > 1 ? crypto.priceHistory[crypto.priceHistory.length - 2] : crypto.currentPrice;
              const change = ((crypto.currentPrice - prevPrice) / prevPrice) * 100;

              return (
                <motion.div key={crypto.id} variants={fadeUp}>
                  <GlassCard padding="sm" glowColor={change >= 0 ? 'green' : 'red'}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-200">{crypto.name}</p>
                        <p className="text-[10px] text-gray-500">{crypto.ticker} • Volatility: {Math.round(crypto.volatility * 100)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold text-gray-200">{formatCurrency(crypto.currentPrice, false)}</p>
                        <p className={`text-[10px] font-mono ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {change >= 0 ? '+' : ''}{formatPercent(change)}
                        </p>
                      </div>
                    </div>
                    <MiniChart data={crypto.priceHistory} height={36} color={change >= 0 ? 'green' : 'red'} className="mb-2" />
                    {holding && (
                      <p className="text-[10px] text-gray-400 border-t border-white/[0.04] pt-1.5 font-mono">
                        Owned: <span className="text-gray-200 font-bold">{holding.units.toFixed(4)} units</span> (~{formatCurrency(holding.units * crypto.currentPrice)})
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <GlowButton
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => buyCrypto(crypto.id, 10000)}
                        disabled={player.cash < 10000}
                      >
                        Buy ₹10K
                      </GlowButton>
                      <GlowButton
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => holding && sellCrypto(crypto.id, holding.units)}
                        disabled={!holding || holding.units <= 0}
                      >
                        Sell All
                      </GlowButton>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MUTUAL FUNDS SECTION
         ======================================================== */}
      {tab === 'mutual_funds' && (
        <div className="space-y-4">
          {/* SIP & Fund Value Details */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <GlassCard hover={false} padding="sm">
              <p className="text-[10px] text-gray-500">Mutual Fund Assets</p>
              <p className="text-sm font-mono font-bold text-gray-200">
                {formatCurrency(
                  market.mutualFundHoldings.reduce((sum, h) => {
                    const fund = market.mutualFunds.find((f) => f.id === h.fundId);
                    return sum + h.units * (fund?.nav || 0);
                  }, 0)
                )}
              </p>
            </GlassCard>
            <GlassCard hover={false} padding="sm">
              <p className="text-[10px] text-gray-500">Active Monthly SIPs</p>
              <p className="text-sm font-mono font-bold text-blue-400">
                {formatCurrency(
                  market.sips.filter((s) => s.isActive).reduce((sum, s) => sum + s.monthlyAmount, 0)
                )}/mo
              </p>
            </GlassCard>
          </div>

          {/* Fund Details Panel */}
          {selectedFund && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard hover={false} glowColor="blue" padding="md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-200">{selectedFund.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{selectedFund.category.replace('_', ' ')} Fund</p>
                  </div>
                  <button onClick={() => setSelectedMF(null)} className="text-gray-500 text-xs hover:text-gray-300">✕</button>
                </div>
                <p className="text-xs text-gray-400 mb-3">{selectedFund.description}</p>
                <MiniChart data={selectedFund.navHistory} height={60} color="blue" className="mb-3" />
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-white/[0.02] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500">Current NAV</p>
                    <p className="font-mono text-gray-200 font-bold">₹{selectedFund.nav.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/[0.02] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500">Historical Returns</p>
                    <p className="font-mono text-emerald-400 font-bold">~{formatPercent(selectedFund.returnRate * 100)} p.a.</p>
                  </div>
                  <div className="bg-white/[0.02] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500">Expense Ratio</p>
                    <p className="font-mono text-gray-400">{formatPercent(selectedFund.expenseRatio * 100)}</p>
                  </div>
                  <div className="bg-white/[0.02] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500">Lock-in Period</p>
                    <p className="font-mono text-gray-300">
                      {selectedFund.lockInMonths > 0 ? `${selectedFund.lockInMonths} months` : 'None'}
                    </p>
                  </div>
                </div>

                {/* Investment Type Selector */}
                <div className="flex gap-2 mb-3 bg-white/[0.03] p-1 rounded-xl">
                  <button
                    onClick={() => setMfInvestType('lumpsum')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      mfInvestType === 'lumpsum' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-gray-500'
                    }`}
                  >
                    Lump Sum
                  </button>
                  <button
                    onClick={() => setMfInvestType('sip')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      mfInvestType === 'sip' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-gray-500'
                    }`}
                  >
                    Monthly SIP
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Amount (Min ₹{selectedFund.minInvestment})</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMfAmount(Math.max(selectedFund.minInvestment, mfAmount - 1000))}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={mfAmount}
                        onChange={(e) => setMfAmount(Math.max(selectedFund.minInvestment, parseInt(e.target.value) || 0))}
                        className="flex-1 text-center bg-white/[0.04] border border-white/[0.08] rounded-lg py-2 font-mono text-sm focus:outline-none focus:border-blue-500/40 text-gray-200"
                      />
                      <button
                        onClick={() => setMfAmount(mfAmount + 1000)}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <GlowButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => {
                      if (mfInvestType === 'lumpsum') {
                        buyMutualFund(selectedFund.id, mfAmount);
                      } else {
                        startSIP(selectedFund.id, mfAmount);
                      }
                      setSelectedMF(null);
                    }}
                    disabled={player.cash < (mfInvestType === 'lumpsum' ? mfAmount : 0) || mfAmount < selectedFund.minInvestment}
                  >
                    {mfInvestType === 'lumpsum' ? 'Invest Lump Sum' : 'Start SIP Order'}
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Active Holdings & SIPs */}
          {(market.mutualFundHoldings.length > 0 || market.sips.filter((s) => s.isActive).length > 0) && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Your Portfolio</p>

              {/* Holdings */}
              {market.mutualFundHoldings.map((holding, idx) => {
                const fund = market.mutualFunds.find((f) => f.id === holding.fundId);
                if (!fund) return null;
                const currentValue = holding.units * fund.nav;
                const pnl = currentValue - holding.totalInvested;
                const pnlPercent = (pnl / holding.totalInvested) * 100;
                const monthsOwned = currentMonth - holding.purchaseMonth;
                const isLocked = fund.lockInMonths > 0 && monthsOwned < fund.lockInMonths;

                return (
                  <GlassCard key={idx} hover={false} glowColor={pnl >= 0 ? 'green' : 'red'} padding="sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-200">{fund.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {holding.units.toFixed(2)} units • Avg NAV: ₹{holding.avgNav.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-gray-200">{formatCurrency(currentValue)}</p>
                        <p className={`text-[10px] font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{formatPercent(pnlPercent)} ({formatCurrency(pnl)})
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/[0.04] pt-2 mt-2">
                      <div className="text-[9px] text-gray-500 flex items-center gap-1">
                        {isLocked ? (
                          <span className="flex items-center gap-0.5 text-orange-400 font-semibold">
                            <Lock className="w-2.5 h-2.5" /> Locked ({fund.lockInMonths - monthsOwned}mo left)
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">🔓 Redeemable</span>
                        )}
                      </div>
                      <GlowButton
                        variant="secondary"
                        size="sm"
                        disabled={isLocked}
                        onClick={() => sellMutualFund(idx)}
                      >
                        Redeem Units
                      </GlowButton>
                    </div>
                  </GlassCard>
                );
              })}

              {/* SIPs */}
              {market.sips.map((sip) => {
                if (!sip.isActive) return null;
                const fund = market.mutualFunds.find((f) => f.id === sip.fundId);

                return (
                  <GlassCard key={sip.id} hover={false} padding="sm" glowColor="blue">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-blue-300">{fund?.name || sip.fundId}</p>
                        <p className="text-[10px] text-gray-500">
                          SIP Amount: <span className="font-mono text-gray-300 font-bold">{formatCurrency(sip.monthlyAmount)}/mo</span> • Next billing next month
                        </p>
                      </div>
                      <GlowButton variant="ghost" size="sm" onClick={() => stopSIP(sip.id)}>
                        Pause SIP
                      </GlowButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Explore Funds List */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Explore Mutual Funds</p>
            {market.mutualFunds.map((fund) => {
              const holding = market.mutualFundHoldings.find((h) => h.fundId === fund.id);
              const prevNav = fund.navHistory.length > 1 ? fund.navHistory[fund.navHistory.length - 2] : fund.nav;
              const returnSign = fund.returnRate >= 0 ? '+' : '';

              return (
                <GlassCard
                  key={fund.id}
                  padding="sm"
                  onClick={() => { setSelectedMF(fund.id); setMfAmount(fund.minInvestment * 2); }}
                  glowColor={holding ? 'blue' : 'none'}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-200">{fund.name}</p>
                      <p className="text-[10px] text-gray-500">
                        NAV: <span className="font-mono text-gray-300">₹{fund.nav.toFixed(2)}</span> • Returns: <span className="text-emerald-400 font-mono">{returnSign}{Math.round(fund.returnRate * 100)}%</span>
                      </p>
                    </div>
                    {holding ? (
                      <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">Invested</span>
                    ) : (
                      <span className="text-[9px] bg-white/[0.04] text-gray-400 px-1.5 py-0.5 rounded font-semibold">Invest</span>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          COMMODITIES SECTION
         ======================================================== */}
      {tab === 'commodities' && (
        <div className="space-y-4">
          {/* Commodity Assets Panel */}
          {selectedCommodity && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard hover={false} glowColor="gold" padding="md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-200">{selectedCommodity.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{selectedCommodity.type.replace('_', ' ')}</p>
                  </div>
                  <button onClick={() => setSelectedComm(null)} className="text-gray-500 text-xs hover:text-gray-300">✕</button>
                </div>
                <p className="text-xs text-gray-400 mb-3">{selectedCommodity.description}</p>
                <MiniChart data={selectedCommodity.priceHistory} height={60} color="cyan" className="mb-3" />
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-white/[0.02] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500">Price per unit</p>
                    <p className="font-mono text-gray-200 font-bold">₹{selectedCommodity.pricePerUnit.toLocaleString()} / {selectedCommodity.unit}</p>
                  </div>
                  {selectedCommodity.type === 'sgb' ? (
                    <div className="bg-white/[0.02] p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500">Interest rate (p.a.)</p>
                      <p className="font-mono text-emerald-400 font-bold">2.5% yield</p>
                    </div>
                  ) : (
                    <div className="bg-white/[0.02] p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500">Storage / Admin Cost</p>
                      <p className="font-mono text-red-400">{formatPercent(selectedCommodity.storageCost * 100)} p.a.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Quantity to buy ({selectedCommodity.unit}s)</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCommAmount(Math.max(1, commAmount - 1))}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={commAmount}
                        onChange={(e) => setCommAmount(Math.max(1, parseInt(e.target.value) || 0))}
                        className="flex-1 text-center bg-white/[0.04] border border-white/[0.08] rounded-lg py-2 font-mono text-sm focus:outline-none focus:border-blue-500/40 text-gray-200"
                      />
                      <button
                        onClick={() => setCommAmount(commAmount + 1)}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center font-mono">
                    Total cost: <span className="text-gray-300">{formatCurrency(selectedCommodity.pricePerUnit * commAmount, false)}</span>
                  </p>

                  <GlowButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => {
                      buyCommodity(selectedCommodity.id, commAmount);
                      setSelectedComm(null);
                    }}
                    disabled={player.cash < selectedCommodity.pricePerUnit * commAmount}
                  >
                    Buy Commodity
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Holdings */}
          {market.commodityHoldings.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Your Metals & Bonds</p>
              {market.commodityHoldings.map((holding, idx) => {
                const commodity = market.commodities.find((c) => c.id === holding.commodityId);
                if (!commodity) return null;

                const currentValue = holding.quantity * commodity.pricePerUnit;
                const profit = currentValue - holding.totalInvested;
                const profitPercent = (profit / holding.totalInvested) * 100;
                const monthsPassed = currentMonth - holding.purchaseMonth;
                const isSgb = commodity.type === 'sgb';
                const sgbMatured = isSgb && monthsPassed >= commodity.maturityMonths;

                return (
                  <GlassCard key={idx} hover={false} glowColor={profit >= 0 ? 'green' : 'red'} padding="sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-200">{commodity.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {holding.quantity} {commodity.unit}s • Avg Buy: ₹{holding.avgBuyPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-gray-200">{formatCurrency(currentValue)}</p>
                        <p className={`text-[10px] font-mono ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {profit >= 0 ? '+' : ''}{formatPercent(profitPercent)} ({formatCurrency(profit)})
                        </p>
                      </div>
                    </div>
                    
                    {isSgb && (
                      <div className="text-[9px] text-gray-500 mb-2 font-mono flex items-center justify-between">
                        <span>Interest earned: <span className="text-emerald-400 font-bold">2.5% yearly (paid monthly)</span></span>
                        <span>
                          {sgbMatured ? (
                            <span className="text-emerald-400 font-bold">✨ MATURED</span>
                          ) : (
                            <span className="text-yellow-500">Maturity in {commodity.maturityMonths - monthsPassed} months</span>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end border-t border-white/[0.04] pt-2 mt-2">
                      <GlowButton
                        variant="secondary"
                        size="sm"
                        disabled={isSgb && !sgbMatured}
                        onClick={() => sellCommodity(idx)}
                      >
                        {isSgb ? (sgbMatured ? 'Redeem SGB Bond' : 'Locked till Maturity') : 'Sell units'}
                      </GlowButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Commodity List */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Commodity Spot Rates</p>
            {market.commodities.map((comm) => {
              const holding = market.commodityHoldings.find((h) => h.commodityId === comm.id);
              return (
                <GlassCard
                  key={comm.id}
                  padding="sm"
                  onClick={() => { setSelectedComm(comm.id); setCommAmount(1); }}
                  glowColor={holding ? 'gold' : 'none'}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-200">{comm.name}</p>
                      <p className="text-[10px] text-gray-500">
                        Price: <span className="font-mono text-gray-300">₹{comm.pricePerUnit.toLocaleString()} / {comm.unit}</span>
                      </p>
                    </div>
                    <span className="text-[9px] bg-white/[0.04] text-yellow-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                      {comm.type === 'sgb' ? 'Bond' : 'Spot'}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          FOREX SECTION
         ======================================================== */}
      {tab === 'forex' && (
        <div className="space-y-4">
          <motion.div variants={fadeUp}>
            <div className="bg-cyan-500/10 border border-cyan-500/15 rounded-xl p-3 text-center">
              <p className="text-xs text-cyan-300 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> High Leverage Forex Trading
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Forex positions are leveraged (10x-50x). Leverage boosts profits but liquidates if loss exceeds margin.</p>
            </div>
          </motion.div>

          {/* Forex Trade Panel */}
          {selectedForexPairData && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard hover={false} glowColor="cyan" padding="md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-200">{selectedForexPairData.name}</p>
                    <p className="text-xs text-gray-500">{selectedForexPairData.id} • Spread: {selectedForexPairData.spread} pips</p>
                  </div>
                  <button onClick={() => setSelectedPair(null)} className="text-gray-500 text-xs hover:text-gray-300">✕</button>
                </div>
                
                <MiniChart data={selectedForexPairData.rateHistory} height={60} color="cyan" className="mb-3" />
                
                <div className="flex gap-2 mb-3 bg-white/[0.03] p-1 rounded-xl">
                  <button
                    onClick={() => setForexType('long')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      forexType === 'long' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-500'
                    }`}
                  >
                    🟩 LONG (Buy)
                  </button>
                  <button
                    onClick={() => setForexType('short')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      forexType === 'short' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-gray-500'
                    }`}
                  >
                    🟥 SHORT (Sell)
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Lot Size */}
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Lot Size (Base Units)</label>
                    <select
                      value={forexLotSize}
                      onChange={(e) => setForexLotSize(Number(e.target.value))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-cyan-500/40 text-gray-200 font-mono"
                    >
                      <option value={1000}>1,000 units (Micro Lot)</option>
                      <option value={10000}>10,000 units (Mini Lot)</option>
                      <option value={50000}>50,000 units (Mid Lot)</option>
                      <option value={100000}>100,000 units (Standard Lot)</option>
                    </select>
                  </div>

                  {/* Leverage Selector */}
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">Leverage Multiplier</label>
                    <div className="flex gap-2">
                      {([10, 20, 30, 50] as const).map((lev) => (
                        <button
                          key={lev}
                          type="button"
                          onClick={() => setForexLeverage(lev)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                            forexLeverage === lev
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-white/[0.02] text-gray-500 border-white/[0.05]'
                          }`}
                        >
                          {lev}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stop Loss & Take Profit */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-400 mb-1 block">Stop Loss (Rate)</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={forexSL}
                        onChange={(e) => setForexSL(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg py-1.5 px-2 text-xs font-mono focus:outline-none text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 mb-1 block">Take Profit (Rate)</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={forexTP}
                        onChange={(e) => setForexTP(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg py-1.5 px-2 text-xs font-mono focus:outline-none text-gray-200"
                      />
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] flex items-center justify-between text-xs">
                    <span className="text-gray-500">Margin Required</span>
                    <span className="font-mono font-bold text-cyan-400">{formatCurrency(calcForexMargin())}</span>
                  </div>

                  <GlowButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => {
                      const sl = forexSL ? Number(forexSL) : undefined;
                      const tp = forexTP ? Number(forexTP) : undefined;
                      const opened = openForexPosition(selectedForexPairData.id, forexType, forexLotSize, forexLeverage, sl, tp);
                      if (opened) {
                        setSelectedPair(null);
                        setForexSL('');
                        setForexTP('');
                      }
                    }}
                    disabled={player.cash < calcForexMargin()}
                  >
                    Open Forex Position
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Active Positions */}
          {(market.forexPositions && market.forexPositions.length > 0) && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Open Forex Positions</p>
              {market.forexPositions.map((pos) => {
                const pair = market.forexPairs.find((p) => p.id === pos.pairId);
                const currentRate = pair ? pair.currentRate : pos.currentRate;
                const pnl = calculateForexPnL({
                  type: pos.type,
                  entryRate: pos.entryRate,
                  currentRate,
                  lotSize: pos.lotSize,
                  leverage: pos.leverage
                });
                const percentage = (pnl / pos.margin) * 100;

                return (
                  <GlassCard key={pos.id} hover={false} glowColor={pnl >= 0 ? 'green' : 'red'} padding="sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            pos.type === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {pos.type.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-gray-200">{pos.pairId.replace('_', ' / ')}</span>
                          <span className="text-[9px] text-gray-500">({pos.leverage}x)</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">
                          Entry: {pos.entryRate.toFixed(4)} • Current: {currentRate.toFixed(4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                        </p>
                        <p className={`text-[9px] font-mono ${pnl >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                          {pnl >= 0 ? '+' : ''}{percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 bg-white/[0.02] p-1.5 rounded text-[9px] font-mono text-gray-500 text-center mb-2">
                      <div>
                        <p className="text-[8px] text-gray-600">Margin Locked</p>
                        <p className="text-gray-300 font-bold">₹{pos.margin.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-600">Stop Loss</p>
                        <p className="text-red-400 font-bold">{pos.stopLoss ? pos.stopLoss.toFixed(4) : 'None'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-600">Take Profit</p>
                        <p className="text-emerald-400 font-bold">{pos.takeProfit ? pos.takeProfit.toFixed(4) : 'None'}</p>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-white/[0.04] pt-2">
                      <GlowButton
                        variant="secondary"
                        size="sm"
                        onClick={() => closeForexPosition(pos.id)}
                      >
                        Close Position
                      </GlowButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Forex Pairs List */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Currencies Market</p>
            {market.forexPairs.map((pair) => {
              const active = market.forexPositions?.filter((pos) => pos.pairId === pair.id).length || 0;
              return (
                <GlassCard
                  key={pair.id}
                  padding="sm"
                  onClick={() => { setSelectedPair(pair.id); setForexLotSize(10000); }}
                  glowColor={active > 0 ? 'cyan' : 'none'}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-200">{pair.id.replace('_', ' / ')}</p>
                      <p className="text-[10px] text-gray-500 font-mono">Rate: {pair.currentRate.toFixed(4)}</p>
                    </div>
                    {active > 0 ? (
                      <span className="text-[9px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                        {active} Active
                      </span>
                    ) : (
                      <span className="text-[9px] bg-white/[0.04] text-gray-400 px-1.5 py-0.5 rounded font-semibold">Trade</span>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
