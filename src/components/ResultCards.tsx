'use client';

import React from 'react';
import { DealResults, formatCurrency, formatPercent } from '@/lib/calculations';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color?: 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'neutral';
  large?: boolean;
}

function MetricCard({ label, value, subtitle, color = 'neutral', large = false }: MetricCardProps) {
  const colors = {
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    red: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    neutral: 'bg-gray-800/50 border-gray-700 text-gray-300',
  };

  // Auto-size: longer values get smaller font to prevent overflow
  const getValueSize = () => {
    const len = value.length;
    if (!large) {
      return len > 10 ? 'text-sm' : len > 7 ? 'text-base' : 'text-lg';
    }
    // Large cards: scale down for longer values
    if (len > 10) return 'text-base md:text-lg';
    if (len > 7) return 'text-lg md:text-xl';
    return 'text-xl md:text-2xl';
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 flex flex-col min-w-0 overflow-hidden ${colors[color]}`}>
      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide opacity-70 mb-1 truncate">{label}</p>
      <p className={`font-bold leading-tight truncate ${getValueSize()}`}>{value}</p>
      {subtitle && <p className="text-[10px] sm:text-xs opacity-60 mt-1 truncate">{subtitle}</p>}
    </div>
  );
}

export function DealScoreBadge({ score }: { score: number }) {
  let color = 'bg-rose-500';
  let label = 'Poor';
  if (score >= 80) {
    color = 'bg-emerald-500';
    label = 'Excellent';
  } else if (score >= 65) {
    color = 'bg-blue-500';
    label = 'Good';
  } else if (score >= 50) {
    color = 'bg-amber-500';
    label = 'Fair';
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`${color} text-white font-bold text-2xl w-16 h-16 rounded-full flex items-center justify-center`}>
        {score}
      </div>
      <div>
        <p className="text-white font-semibold text-lg">{label}</p>
        <p className="text-gray-400 text-xs">Deal Score</p>
      </div>
    </div>
  );
}

export function SummaryDashboard({ results }: { results: DealResults }) {
  return (
    <div className="space-y-6">
      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Net Profit"
          value={formatCurrency(results.netProfit)}
          color={results.netProfit > 0 ? 'green' : 'red'}
          large
        />
        <MetricCard
          label="Cash-on-Cash"
          value={formatPercent(results.cashOnCashReturn)}
          subtitle="Annual return on cash invested"
          color={results.cashOnCashReturn > 10 ? 'green' : results.cashOnCashReturn > 5 ? 'amber' : 'red'}
          large
        />
        <MetricCard
          label="Monthly Cashflow"
          value={formatCurrency(results.netMonthlyCashflow)}
          subtitle={`${formatCurrency(results.netAnnualCashflow)}/yr`}
          color={results.netMonthlyCashflow > 0 ? 'green' : 'red'}
          large
        />
        <MetricCard
          label="Cap Rate"
          value={formatPercent(results.capRate)}
          subtitle="NOI / Property Value"
          color={results.capRate > 8 ? 'green' : results.capRate > 5 ? 'amber' : 'red'}
          large
        />
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          label="Total Cash In"
          value={formatCurrency(results.totalCashIn)}
          subtitle="Your money in the deal"
          color="red"
        />
        <MetricCard
          label="Cash Out (Refi)"
          value={formatCurrency(results.totalCashOut)}
          subtitle="Recaptured via refinance"
          color="green"
        />
        <MetricCard
          label="Net Cash in Deal"
          value={formatCurrency(results.totalCashIn - results.totalCashOut)}
          subtitle="Cash left working"
          color="blue"
        />
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="DSCR"
          value={results.dscr.toFixed(2)}
          subtitle={results.dscr >= 1.25 ? '✅ Meets lender minimum' : '⚠️ Below 1.25 threshold'}
          color={results.dscr >= 1.25 ? 'green' : 'red'}
        />
        <MetricCard
          label="Equity Multiple"
          value={`${results.equityMultiple.toFixed(2)}x`}
          subtitle="5-year projection"
          color="purple"
        />
        <MetricCard
          label="Unlevered Return"
          value={formatPercent(results.unleveredReturn)}
          subtitle="Return without leverage"
          color="blue"
        />
        <MetricCard
          label="Levered Return"
          value={formatPercent(results.leveredReturn)}
          subtitle="Return with financing"
          color="purple"
        />
      </div>

      {/* 70% Rule */}
      <div className={`rounded-xl border p-4 ${results.meetsSeventy ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">70% Rule</p>
            <p className={`text-lg font-bold ${results.meetsSeventy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {results.meetsSeventy ? '✅ PASSES' : '❌ FAILS'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Max Purchase Price</p>
            <p className="text-lg font-bold text-white">{formatCurrency(results.maxPurchasePrice70)}</p>
          </div>
        </div>
      </div>

      {/* NOI & Expense Summary */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Annual NOI"
          value={formatCurrency(results.noi)}
          subtitle="Net Operating Income"
          color="green"
        />
        <MetricCard
          label="Monthly Expenses"
          value={formatCurrency(results.totalMonthlyExpenses)}
          subtitle="Total operating expenses"
          color="amber"
        />
      </div>
    </div>
  );
}

export function ExpenseBreakdown({ results }: { results: DealResults }) {
  const expenses = [
    { label: 'Vacancy', value: results.monthlyExpenseBreakdown.vacancy, color: 'bg-rose-500' },
    { label: 'Property Mgmt', value: results.monthlyExpenseBreakdown.propertyMgmt, color: 'bg-blue-500' },
    { label: 'Maintenance', value: results.monthlyExpenseBreakdown.maintenance, color: 'bg-amber-500' },
    { label: 'Insurance', value: results.monthlyExpenseBreakdown.insurance, color: 'bg-purple-500' },
    { label: 'Property Tax', value: results.monthlyExpenseBreakdown.propertyTax, color: 'bg-cyan-500' },
    { label: 'HOA', value: results.monthlyExpenseBreakdown.hoa, color: 'bg-orange-500' },
    { label: 'CapEx Reserve', value: results.monthlyExpenseBreakdown.capex, color: 'bg-emerald-500' },
  ].filter((e) => e.value > 0);

  const total = expenses.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-2">
      {expenses.map((exp) => (
        <div key={exp.label} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${exp.color}`} />
          <span className="text-sm text-gray-300 flex-1">{exp.label}</span>
          <span className="text-sm text-white font-medium">{formatCurrency(exp.value)}/mo</span>
          <span className="text-xs text-gray-500 w-12 text-right">
            {((exp.value / total) * 100).toFixed(0)}%
          </span>
        </div>
      ))}
      <div className="border-t border-gray-700 pt-2 mt-2 flex items-center gap-3">
        <div className="w-3 h-3" />
        <span className="text-sm text-white font-semibold flex-1">Total</span>
        <span className="text-sm text-white font-bold">{formatCurrency(total)}/mo</span>
      </div>
    </div>
  );
}
