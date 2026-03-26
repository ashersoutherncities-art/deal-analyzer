'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  DealInputs,
  getDefaultInputs,
  calculateDeal,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';
import { NumberInput, Toggle, SectionCard } from '@/components/InputSection';
import {
  SummaryDashboard,
  DealScoreBadge,
  ExpenseBreakdown,
} from '@/components/ResultCards';

export default function Home() {
  const [inputs, setInputs] = useState<DealInputs>(getDefaultInputs());
  const printRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => calculateDeal(inputs), [inputs]);

  const update = <K extends keyof DealInputs>(key: K, value: DealInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const updateNested = <K extends keyof DealInputs>(
    key: K,
    subKey: string,
    value: number
  ) => {
    setInputs((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as Record<string, number>), [subKey]: value },
    }));
  };

  const handleExport = () => {
    const data = {
      inputs,
      results,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-lg">
              DA
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SFH Deal Analyzer</h1>
              <p className="text-xs text-gray-400">Southern Cities Enterprises</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DealScoreBadge score={results.dealScore} />
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              📥 Export
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors print:hidden"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6" ref={printRef}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Inputs */}
          <div className="lg:col-span-1 space-y-4">
            {/* Purchase */}
            <SectionCard title="Purchase" icon="🏠" color="emerald">
              <NumberInput
                label="Purchase Price"
                value={inputs.purchasePrice}
                onChange={(v) => update('purchasePrice', v)}
                prefix="$"
                tooltip="Acquisition price of the property"
              />
              <Toggle
                label="Use Itemized Closing Costs"
                checked={inputs.useItemizedClosing}
                onChange={(v) => update('useItemizedClosing', v)}
              />
              {inputs.useItemizedClosing ? (
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Title Insurance"
                    value={inputs.closingCostItemized.titleInsurance}
                    onChange={(v) => updateNested('closingCostItemized', 'titleInsurance', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Attorney Fees"
                    value={inputs.closingCostItemized.attorneyFees}
                    onChange={(v) => updateNested('closingCostItemized', 'attorneyFees', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Recording Fees"
                    value={inputs.closingCostItemized.recordingFees}
                    onChange={(v) => updateNested('closingCostItemized', 'recordingFees', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Prorated Interest"
                    value={inputs.closingCostItemized.proratedInterest}
                    onChange={(v) => updateNested('closingCostItemized', 'proratedInterest', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Inspections"
                    value={inputs.closingCostItemized.inspections}
                    onChange={(v) => updateNested('closingCostItemized', 'inspections', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Survey"
                    value={inputs.closingCostItemized.survey}
                    onChange={(v) => updateNested('closingCostItemized', 'survey', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Other"
                    value={inputs.closingCostItemized.other}
                    onChange={(v) => updateNested('closingCostItemized', 'other', v)}
                    prefix="$"
                  />
                </div>
              ) : (
                <NumberInput
                  label="Closing Cost %"
                  value={inputs.closingCostPct}
                  onChange={(v) => update('closingCostPct', v)}
                  suffix="%"
                  step={0.5}
                  tooltip="Typically 2-5% of purchase price"
                />
              )}
              <div className="border-t border-gray-800 pt-3 mt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Lender Fees</p>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Origination"
                    value={inputs.lenderFees.originationPct}
                    onChange={(v) => updateNested('lenderFees', 'originationPct', v)}
                    suffix="%"
                    step={0.5}
                  />
                  <NumberInput
                    label="Underwriting"
                    value={inputs.lenderFees.underwriting}
                    onChange={(v) => updateNested('lenderFees', 'underwriting', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Appraisal"
                    value={inputs.lenderFees.appraisal}
                    onChange={(v) => updateNested('lenderFees', 'appraisal', v)}
                    prefix="$"
                  />
                  <NumberInput
                    label="Processing"
                    value={inputs.lenderFees.processing}
                    onChange={(v) => updateNested('lenderFees', 'processing', v)}
                    prefix="$"
                  />
                </div>
              </div>
              <NumberInput
                label="Broker Fee"
                value={inputs.brokerFeePct}
                onChange={(v) => update('brokerFeePct', v)}
                suffix="%"
                step={0.5}
                tooltip="Mortgage broker fee as % of loan amount"
              />
              <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Closing Costs</span>
                  <span className="text-white">{formatCurrency(results.totalClosingCosts)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Lender Fees</span>
                  <span className="text-white">{formatCurrency(results.totalLenderFees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Broker Fees</span>
                  <span className="text-white">{formatCurrency(results.totalBrokerFees)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-700 pt-1 mt-1">
                  <span className="text-emerald-400">Total Purchase Cost</span>
                  <span className="text-emerald-400">{formatCurrency(results.totalPurchaseCost)}</span>
                </div>
              </div>
            </SectionCard>

            {/* Rehab */}
            <SectionCard title="Rehab" icon="🔨" color="amber">
              <NumberInput
                label="Renovation Cost"
                value={inputs.rehabCost}
                onChange={(v) => update('rehabCost', v)}
                prefix="$"
                tooltip="Total estimated renovation/repair costs"
              />
              <NumberInput
                label="Holdback %"
                value={inputs.rehabHoldbackPct}
                onChange={(v) => update('rehabHoldbackPct', v)}
                suffix="%"
                tooltip="% held back by lender until work completion"
              />
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Rehab</span>
                  <span className="text-white">{formatCurrency(results.totalRehabCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Holdback Amount</span>
                  <span className="text-amber-400">{formatCurrency(results.rehabHoldback)}</span>
                </div>
              </div>
            </SectionCard>

            {/* Valuations */}
            <SectionCard title="Valuations" icon="📊" color="purple">
              <NumberInput
                label="Sales Price (ARV)"
                value={inputs.salesPrice}
                onChange={(v) => update('salesPrice', v)}
                prefix="$"
                tooltip="After Repair Value / expected sales price"
              />
              <Toggle
                label="Use Custom ARV Estimate"
                checked={inputs.useUserArv}
                onChange={(v) => update('useUserArv', v)}
              />
              {inputs.useUserArv && (
                <NumberInput
                  label="Your ARV Estimate"
                  value={inputs.userEstimatedArv}
                  onChange={(v) => update('userEstimatedArv', v)}
                  prefix="$"
                />
              )}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ARV Used</span>
                  <span className="text-purple-400 font-bold">{formatCurrency(results.arv)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Purchase as % of ARV</span>
                  <span className="text-white">
                    {formatPercent((inputs.purchasePrice / results.arv) * 100)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ARV Equity</span>
                  <span className={results.arvEquity > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {formatCurrency(results.arvEquity)}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* MIDDLE COLUMN - Financing & Rental */}
          <div className="lg:col-span-1 space-y-4">
            {/* Hard Money Loan */}
            <SectionCard title="Hard Money Loan" icon="🏦" color="blue">
              <NumberInput
                label="LTV (% of ARV)"
                value={inputs.hmlLtvPct}
                onChange={(v) => update('hmlLtvPct', v)}
                suffix="%"
                step={5}
                tooltip="Loan as percentage of After Repair Value (typical: 65-75%)"
              />
              <NumberInput
                label="Interest Rate"
                value={inputs.hmlRate}
                onChange={(v) => update('hmlRate', v)}
                suffix="%"
                step={0.25}
                tooltip="Annual interest rate (typical: 10-15%)"
              />
              <NumberInput
                label="Points"
                value={inputs.hmlPoints}
                onChange={(v) => update('hmlPoints', v)}
                suffix="pts"
                step={0.5}
                tooltip="Origination points (typical: 2-4)"
              />
              <NumberInput
                label="Term"
                value={inputs.hmlTermMonths}
                onChange={(v) => update('hmlTermMonths', v)}
                suffix="mo"
                tooltip="Loan term in months (typical: 6-18)"
              />
              <Toggle
                label="Interest Only"
                checked={inputs.hmlInterestOnly}
                onChange={(v) => update('hmlInterestOnly', v)}
              />
              <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Loan Amount</span>
                  <span className="text-white">{formatCurrency(results.hmlLoanAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Actual LTV</span>
                  <span className="text-white">{formatPercent(results.hmlLtvActual)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Payment</span>
                  <span className="text-blue-400 font-bold">
                    {formatCurrency(results.hmlMonthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Points Cost</span>
                  <span className="text-white">{formatCurrency(results.hmlPointsCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Interest</span>
                  <span className="text-white">{formatCurrency(results.hmlTotalInterest)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-700 pt-1">
                  <span className="text-blue-400">Total HML Cost</span>
                  <span className="text-blue-400">{formatCurrency(results.hmlTotalCost)}</span>
                </div>
              </div>
            </SectionCard>

            {/* Cash-Out Refinance */}
            <SectionCard title="Cash-Out Refinance" icon="💰" color="cyan">
              <Toggle
                label="Enable Refi (BRRRR)"
                checked={inputs.refiEnabled}
                onChange={(v) => update('refiEnabled', v)}
              />
              {inputs.refiEnabled && (
                <>
                  <NumberInput
                    label="Refi LTV %"
                    value={inputs.refiLtvPct}
                    onChange={(v) => update('refiLtvPct', v)}
                    suffix="%"
                    step={5}
                    tooltip="Cash-out refi LTV (Fannie/Freddie max: 75-80%)"
                  />
                  <NumberInput
                    label="New Rate"
                    value={inputs.refiRate}
                    onChange={(v) => update('refiRate', v)}
                    suffix="%"
                    step={0.125}
                  />
                  <NumberInput
                    label="Term"
                    value={inputs.refiTermYears}
                    onChange={(v) => update('refiTermYears', v)}
                    suffix="yr"
                  />
                  <NumberInput
                    label="Refi Closing Cost %"
                    value={inputs.refiClosingCostPct}
                    onChange={(v) => update('refiClosingCostPct', v)}
                    suffix="%"
                    step={0.5}
                  />
                  <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">New Loan</span>
                      <span className="text-white">{formatCurrency(results.refiLoanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Monthly Payment</span>
                      <span className="text-white">{formatCurrency(results.refiMonthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Refi Closing Costs</span>
                      <span className="text-white">{formatCurrency(results.refiClosingCosts)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-700 pt-1">
                      <span className="text-cyan-400">Cash Available</span>
                      <span className={results.cashOutAvailable > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatCurrency(results.cashOutAvailable)}
                      </span>
                    </div>
                    {results.refiBreakEvenMonths > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Break-Even</span>
                        <span className="text-white">{results.refiBreakEvenMonths} months</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </SectionCard>

            {/* Rental Metrics */}
            <SectionCard title="Rental Income" icon="🏘️" color="orange">
              <NumberInput
                label="Monthly Rent"
                value={inputs.monthlyRent}
                onChange={(v) => update('monthlyRent', v)}
                prefix="$"
              />
              <NumberInput
                label="Vacancy Rate"
                value={inputs.vacancyPct}
                onChange={(v) => update('vacancyPct', v)}
                suffix="%"
                step={1}
                tooltip="Industry avg: 5-8% for SFH"
              />
              <NumberInput
                label="Property Management"
                value={inputs.propertyMgmtPct}
                onChange={(v) => update('propertyMgmtPct', v)}
                suffix="%"
                step={1}
                tooltip="Typical: 8-12% of rent"
              />
              <NumberInput
                label="Maintenance"
                value={inputs.maintenancePct}
                onChange={(v) => update('maintenancePct', v)}
                suffix="%"
                step={1}
                tooltip="Typical: 5-10% of rent"
              />
              <NumberInput
                label="CapEx Reserve"
                value={inputs.capexPct}
                onChange={(v) => update('capexPct', v)}
                suffix="%"
                step={1}
                tooltip="Capital expenditures reserve: 5-10%"
              />
              <NumberInput
                label="Annual Insurance"
                value={inputs.insuranceAnnual}
                onChange={(v) => update('insuranceAnnual', v)}
                prefix="$"
              />
              <NumberInput
                label="Annual Property Tax"
                value={inputs.propertyTaxAnnual}
                onChange={(v) => update('propertyTaxAnnual', v)}
                prefix="$"
              />
              <NumberInput
                label="Monthly HOA"
                value={inputs.hoaMonthly}
                onChange={(v) => update('hoaMonthly', v)}
                prefix="$"
              />
            </SectionCard>

            {/* Project Info */}
            <SectionCard title="Project Info" icon="📋" color="rose">
              <NumberInput
                label="Timeline"
                value={inputs.projectTimelineMonths}
                onChange={(v) => update('projectTimelineMonths', v)}
                suffix="months"
              />
              <NumberInput
                label="Credit Score Required"
                value={inputs.creditScoreRequired}
                onChange={(v) => update('creditScoreRequired', v)}
                min={300}
                max={850}
              />
            </SectionCard>
          </div>

          {/* RIGHT COLUMN - Results Dashboard */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-900 rounded-xl border border-emerald-500/30 p-5">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <span>📈</span> Deal Summary
              </h3>
              <SummaryDashboard results={results} />
            </div>

            <div className="bg-gray-900 rounded-xl border border-amber-500/30 p-5">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <span>💸</span> Expense Breakdown
              </h3>
              <ExpenseBreakdown results={results} />
            </div>

            {/* Quick Benchmarks */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <span>📏</span> Industry Benchmarks
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">1% Rule (Rent/Price)</span>
                  <span
                    className={
                      inputs.monthlyRent / inputs.purchasePrice >= 0.01
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }
                  >
                    {((inputs.monthlyRent / inputs.purchasePrice) * 100).toFixed(2)}%
                    {inputs.monthlyRent / inputs.purchasePrice >= 0.01 ? ' ✅' : ' ❌'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">2% Rule (Strong CF)</span>
                  <span
                    className={
                      inputs.monthlyRent / inputs.purchasePrice >= 0.02
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    {((inputs.monthlyRent / inputs.purchasePrice) * 100).toFixed(2)}%
                    {inputs.monthlyRent / inputs.purchasePrice >= 0.02 ? ' ✅' : ' ⚠️'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">50% Rule (OpEx)</span>
                  <span className="text-white">
                    {formatPercent(
                      (results.totalMonthlyExpenses / results.grossMonthlyRent) * 100
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Purchase/ARV Ratio</span>
                  <span
                    className={
                      inputs.purchasePrice / results.arv <= 0.5
                        ? 'text-emerald-400'
                        : inputs.purchasePrice / results.arv <= 0.7
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }
                  >
                    {formatPercent((inputs.purchasePrice / results.arv) * 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DSCR Min (1.25)</span>
                  <span className={results.dscr >= 1.25 ? 'text-emerald-400' : 'text-rose-400'}>
                    {results.dscr.toFixed(2)} {results.dscr >= 1.25 ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HML LTV Cap (75%)</span>
                  <span
                    className={
                      results.hmlLtvActual <= 75 ? 'text-emerald-400' : 'text-rose-400'
                    }
                  >
                    {formatPercent(results.hmlLtvActual)}{' '}
                    {results.hmlLtvActual <= 75 ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deal Timeline */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <span>⏱️</span> Deal Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-white">Acquire & Close</p>
                    <p className="text-gray-500 text-xs">Month 0-1</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-white">Rehab</p>
                    <p className="text-gray-500 text-xs">
                      Month 1-{Math.ceil(inputs.projectTimelineMonths * 0.7)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-white">Tenant Placement</p>
                    <p className="text-gray-500 text-xs">
                      Month {Math.ceil(inputs.projectTimelineMonths * 0.7)}-
                      {Math.ceil(inputs.projectTimelineMonths * 0.85)}
                    </p>
                  </div>
                </div>
                {inputs.refiEnabled && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                      4
                    </div>
                    <div>
                      <p className="text-white">Cash-Out Refi</p>
                      <p className="text-gray-500 text-xs">
                        Month {inputs.projectTimelineMonths}+
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                    🔄
                  </div>
                  <div>
                    <p className="text-white">Repeat</p>
                    <p className="text-gray-500 text-xs">Use cash out for next deal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        <p>SFH Deal Analyzer • Southern Cities Enterprises • Built with research-backed calculations</p>
        <p className="mt-1">
          ARV: Sales Comparison Approach | HML: LTARV Standard | Rental: Industry Benchmarks |
          Refi: Fannie Mae/Freddie Mac Guidelines
        </p>
      </footer>
    </div>
  );
}
