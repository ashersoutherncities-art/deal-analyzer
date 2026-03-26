// ============================================================
// SFH Deal Analyzer - Core Calculation Engine
// Based on industry standards: Fannie Mae, Freddie Mac, HML
// ============================================================

export interface DealInputs {
  // Purchase
  purchasePrice: number;
  closingCostPct: number; // % of purchase price
  closingCostItemized: {
    titleInsurance: number;
    attorneyFees: number;
    recordingFees: number;
    proratedInterest: number;
    inspections: number;
    survey: number;
    other: number;
  };
  useItemizedClosing: boolean;
  lenderFees: {
    originationPct: number; // % of loan amount
    underwriting: number;
    appraisal: number;
    processing: number;
  };
  brokerFeePct: number; // % of loan amount

  // Rehab
  rehabCost: number;
  rehabHoldbackPct: number; // % held back by lender

  // Hard Money Loan
  hmlLtvPct: number; // % of ARV
  hmlRate: number; // annual %
  hmlPoints: number; // points charged
  hmlTermMonths: number;
  hmlInterestOnly: boolean;

  // Valuations
  salesPrice: number; // ARV / sales price
  userEstimatedArv: number;
  useUserArv: boolean;

  // Cash-Out Refinance
  refiEnabled: boolean;
  refiLtvPct: number; // % of ARV
  refiRate: number; // annual %
  refiTermYears: number;
  refiClosingCostPct: number; // % of new loan

  // Rental
  monthlyRent: number;
  vacancyPct: number;
  propertyMgmtPct: number; // % of rent
  maintenancePct: number; // % of rent
  insuranceAnnual: number;
  propertyTaxAnnual: number;
  hoaMonthly: number;
  capexPct: number; // % of rent

  // Project
  projectTimelineMonths: number;
  creditScoreRequired: number;
}

export interface DealResults {
  // Purchase
  totalClosingCosts: number;
  totalLenderFees: number;
  totalBrokerFees: number;
  totalPurchaseCost: number;

  // Rehab
  totalRehabCost: number;
  rehabHoldback: number;

  // HML
  hmlLoanAmount: number;
  hmlLtvActual: number;
  hmlMonthlyPayment: number;
  hmlTotalInterest: number;
  hmlPointsCost: number;
  hmlTotalCost: number;

  // Valuations
  arv: number;
  arvEquity: number; // ARV - total cost
  arvEquityPct: number;

  // Refi
  refiLoanAmount: number;
  refiMonthlyPayment: number;
  refiClosingCosts: number;
  cashOutAvailable: number;
  refiBreakEvenMonths: number;

  // Rental
  grossMonthlyRent: number;
  effectiveMonthlyRent: number; // after vacancy
  totalMonthlyExpenses: number;
  monthlyExpenseBreakdown: {
    vacancy: number;
    propertyMgmt: number;
    maintenance: number;
    insurance: number;
    propertyTax: number;
    hoa: number;
    capex: number;
  };
  netMonthlyCashflow: number;
  netAnnualCashflow: number;

  // Returns
  totalCashIn: number;
  totalCashOut: number;
  netProfit: number;
  cashOnCashReturn: number;
  unleveredReturn: number;
  leveredReturn: number;
  equityMultiple: number;
  capRate: number;
  dscr: number;
  noi: number;

  // Deal Quality
  meetsSeventy: boolean;
  maxPurchasePrice70: number;
  dealScore: number; // 0-100
}

export function getDefaultInputs(): DealInputs {
  return {
    purchasePrice: 100000,
    closingCostPct: 3,
    closingCostItemized: {
      titleInsurance: 1200,
      attorneyFees: 800,
      recordingFees: 150,
      proratedInterest: 500,
      inspections: 450,
      survey: 400,
      other: 200,
    },
    useItemizedClosing: false,
    lenderFees: {
      originationPct: 2,
      underwriting: 500,
      appraisal: 500,
      processing: 400,
    },
    brokerFeePct: 1,

    rehabCost: 40000,
    rehabHoldbackPct: 10,

    hmlLtvPct: 70,
    hmlRate: 12,
    hmlPoints: 2,
    hmlTermMonths: 12,
    hmlInterestOnly: true,

    salesPrice: 200000,
    userEstimatedArv: 200000,
    useUserArv: false,

    refiEnabled: true,
    refiLtvPct: 75,
    refiRate: 7.5,
    refiTermYears: 30,
    refiClosingCostPct: 2,

    monthlyRent: 1800,
    vacancyPct: 8,
    propertyMgmtPct: 10,
    maintenancePct: 8,
    insuranceAnnual: 1200,
    propertyTaxAnnual: 2400,
    hoaMonthly: 0,
    capexPct: 5,

    projectTimelineMonths: 6,
    creditScoreRequired: 680,
  };
}

export function calculateDeal(inputs: DealInputs): DealResults {
  const arv = inputs.useUserArv ? inputs.userEstimatedArv : inputs.salesPrice;

  // === PURCHASE COSTS ===
  const totalClosingCosts = inputs.useItemizedClosing
    ? Object.values(inputs.closingCostItemized).reduce((a, b) => a + b, 0)
    : inputs.purchasePrice * (inputs.closingCostPct / 100);

  // HML loan amount (based on ARV LTV)
  const hmlLoanAmount = arv * (inputs.hmlLtvPct / 100);

  const totalLenderFees =
    hmlLoanAmount * (inputs.lenderFees.originationPct / 100) +
    inputs.lenderFees.underwriting +
    inputs.lenderFees.appraisal +
    inputs.lenderFees.processing;

  const totalBrokerFees = hmlLoanAmount * (inputs.brokerFeePct / 100);

  const totalPurchaseCost =
    inputs.purchasePrice + totalClosingCosts + totalLenderFees + totalBrokerFees;

  // === REHAB ===
  const rehabHoldback = inputs.rehabCost * (inputs.rehabHoldbackPct / 100);
  const totalRehabCost = inputs.rehabCost; // holdback is lender-side

  // === HARD MONEY LOAN ===
  const hmlMonthlyRate = inputs.hmlRate / 100 / 12;
  const hmlPointsCost = hmlLoanAmount * (inputs.hmlPoints / 100);

  let hmlMonthlyPayment: number;
  if (inputs.hmlInterestOnly) {
    hmlMonthlyPayment = hmlLoanAmount * hmlMonthlyRate;
  } else {
    // Standard amortization
    hmlMonthlyPayment =
      (hmlLoanAmount * hmlMonthlyRate * Math.pow(1 + hmlMonthlyRate, inputs.hmlTermMonths)) /
      (Math.pow(1 + hmlMonthlyRate, inputs.hmlTermMonths) - 1);
  }

  const hmlTotalInterest = inputs.hmlInterestOnly
    ? hmlMonthlyPayment * inputs.hmlTermMonths
    : hmlMonthlyPayment * inputs.hmlTermMonths - hmlLoanAmount;

  const hmlTotalCost = hmlTotalInterest + hmlPointsCost + totalLenderFees;

  const hmlLtvActual = (hmlLoanAmount / arv) * 100;

  // === VALUATIONS ===
  const totalProjectCost = totalPurchaseCost + totalRehabCost + hmlTotalCost;
  const arvEquity = arv - totalProjectCost;
  const arvEquityPct = (arvEquity / arv) * 100;

  // === CASH-OUT REFINANCE ===
  const refiLoanAmount = inputs.refiEnabled ? arv * (inputs.refiLtvPct / 100) : 0;
  const refiClosingCosts = refiLoanAmount * (inputs.refiClosingCostPct / 100);
  const refiMonthlyRate = inputs.refiRate / 100 / 12;
  const refiTotalPayments = inputs.refiTermYears * 12;
  const refiMonthlyPayment = inputs.refiEnabled
    ? (refiLoanAmount * refiMonthlyRate * Math.pow(1 + refiMonthlyRate, refiTotalPayments)) /
      (Math.pow(1 + refiMonthlyRate, refiTotalPayments) - 1)
    : 0;

  // Cash out = new loan - refi costs - remaining HML balance (assume HML fully repaid)
  const cashOutAvailable = inputs.refiEnabled
    ? refiLoanAmount - refiClosingCosts - hmlLoanAmount
    : 0;

  // Break-even: how many months of HML payment savings to cover refi costs
  const monthlySavings = hmlMonthlyPayment - refiMonthlyPayment;
  const refiBreakEvenMonths =
    monthlySavings > 0 ? Math.ceil(refiClosingCosts / monthlySavings) : 0;

  // === RENTAL METRICS ===
  const grossMonthlyRent = inputs.monthlyRent;
  const vacancyLoss = grossMonthlyRent * (inputs.vacancyPct / 100);
  const effectiveMonthlyRent = grossMonthlyRent - vacancyLoss;

  const monthlyExpenseBreakdown = {
    vacancy: vacancyLoss,
    propertyMgmt: grossMonthlyRent * (inputs.propertyMgmtPct / 100),
    maintenance: grossMonthlyRent * (inputs.maintenancePct / 100),
    insurance: inputs.insuranceAnnual / 12,
    propertyTax: inputs.propertyTaxAnnual / 12,
    hoa: inputs.hoaMonthly,
    capex: grossMonthlyRent * (inputs.capexPct / 100),
  };

  const totalMonthlyExpenses = Object.values(monthlyExpenseBreakdown).reduce(
    (a, b) => a + b,
    0
  );

  // Debt service (use refi payment if enabled, otherwise HML)
  const debtService = inputs.refiEnabled ? refiMonthlyPayment : hmlMonthlyPayment;

  const netMonthlyCashflow = effectiveMonthlyRent - totalMonthlyExpenses - debtService;
  const netAnnualCashflow = netMonthlyCashflow * 12;

  // === NOI ===
  // Standard NOI = Gross Rent - Vacancy - OpEx (excl debt service)
  const standardNoi = grossMonthlyRent * 12 - vacancyLoss * 12 - (totalMonthlyExpenses - vacancyLoss) * 12;

  // === RETURNS ===
  // Total cash invested by buyer
  const downPayment = Math.max(0, inputs.purchasePrice + inputs.rehabCost - hmlLoanAmount);
  const holdingCosts = hmlMonthlyPayment * inputs.projectTimelineMonths;
  const totalCashIn =
    downPayment + totalClosingCosts + totalLenderFees + totalBrokerFees + hmlPointsCost + holdingCosts;

  const cashRecaptured = inputs.refiEnabled ? Math.max(0, cashOutAvailable) : 0;
  const totalCashOut = cashRecaptured;
  const netCashInDeal = totalCashIn - totalCashOut;

  // Net profit (flip scenario)
  const netProfit = arv - totalProjectCost;

  // Cash-on-Cash (rental scenario)
  const cashOnCashReturn = netCashInDeal > 0 ? (netAnnualCashflow / netCashInDeal) * 100 : Infinity;

  // Unlevered return
  const unleveredReturn =
    totalProjectCost > 0 ? (standardNoi / totalProjectCost) * 100 : 0;

  // Levered return
  const leveredReturn = netCashInDeal > 0 ? (netAnnualCashflow / netCashInDeal) * 100 : Infinity;

  // Equity multiple (over 5 years)
  const holdYears = 5;
  const equityMultiple =
    netCashInDeal > 0
      ? (netAnnualCashflow * holdYears + netCashInDeal) / netCashInDeal
      : Infinity;

  // Cap rate
  const capRate = arv > 0 ? (standardNoi / arv) * 100 : 0;

  // DSCR
  const annualDebtService = debtService * 12;
  const dscr = annualDebtService > 0 ? standardNoi / annualDebtService : Infinity;

  // === 70% RULE ===
  const maxPurchasePrice70 = arv * 0.7 - inputs.rehabCost;
  const meetsSeventy = inputs.purchasePrice <= maxPurchasePrice70;

  // === DEAL SCORE (0-100) ===
  let dealScore = 50; // base
  if (meetsSeventy) dealScore += 15;
  if (cashOnCashReturn > 12) dealScore += 10;
  else if (cashOnCashReturn > 8) dealScore += 5;
  if (capRate > 8) dealScore += 10;
  else if (capRate > 6) dealScore += 5;
  if (dscr > 1.5) dealScore += 10;
  else if (dscr > 1.25) dealScore += 5;
  else if (dscr < 1) dealScore -= 15;
  if (netMonthlyCashflow > 500) dealScore += 5;
  else if (netMonthlyCashflow < 0) dealScore -= 20;
  if (arvEquityPct > 30) dealScore += 5;
  if (inputs.purchasePrice / arv < 0.5) dealScore += 5; // Darius's 30-50% ARV target
  dealScore = Math.max(0, Math.min(100, dealScore));

  return {
    totalClosingCosts,
    totalLenderFees,
    totalBrokerFees,
    totalPurchaseCost,

    totalRehabCost,
    rehabHoldback,

    hmlLoanAmount,
    hmlLtvActual,
    hmlMonthlyPayment,
    hmlTotalInterest,
    hmlPointsCost,
    hmlTotalCost,

    arv,
    arvEquity,
    arvEquityPct,

    refiLoanAmount,
    refiMonthlyPayment,
    refiClosingCosts,
    cashOutAvailable,
    refiBreakEvenMonths,

    grossMonthlyRent,
    effectiveMonthlyRent,
    totalMonthlyExpenses,
    monthlyExpenseBreakdown,
    netMonthlyCashflow,
    netAnnualCashflow,

    totalCashIn,
    totalCashOut,
    netProfit,
    cashOnCashReturn,
    unleveredReturn,
    leveredReturn,
    equityMultiple,
    capRate,
    dscr,
    noi: standardNoi,

    meetsSeventy,
    maxPurchasePrice70,
    dealScore,
  };
}

export function formatCurrency(value: number): string {
  if (!isFinite(value)) return '∞';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  if (!isFinite(value)) return '∞%';
  return `${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  if (!isFinite(value)) return '∞';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
