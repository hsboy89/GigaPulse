import { Portfolio, PortfolioResult, TeslaPrice, Scenario } from '../types';

const DEDUCTION = 2500000; // 250만원 공제
const TAX_RATE = 0.22; // 22% 세율

export function calculatePortfolio(
  portfolio: Portfolio,
  currentPrice: TeslaPrice,
  scenario?: Scenario
): PortfolioResult {
  const currentValue = portfolio.shares * currentPrice.current;
  const initialValue = portfolio.shares * portfolio.avgPrice;
  const profit = currentValue - initialValue;
  const profitPercent = (profit / initialValue) * 100;
  
  // 원화 변환
  const profitKRW = profit * portfolio.exchangeRate;
  
  // 세금 계산
  const taxableAmount = Math.max(0, profitKRW - DEDUCTION);
  const tax = taxableAmount * TAX_RATE;
  const afterTaxProfit = profitKRW - tax;
  
  // 시나리오 시뮬레이션
  let scenarioValue = currentValue;
  let scenarioProfit = profit;
  let scenarioProfitPercent = profitPercent;
  
  if (scenario) {
    const scenarioPrice = simulateScenario(currentPrice.current, scenario);
    scenarioValue = portfolio.shares * scenarioPrice;
    scenarioProfit = scenarioValue - initialValue;
    scenarioProfitPercent = (scenarioProfit / initialValue) * 100;
  }
  
  return {
    currentValue,
    profit,
    profitPercent,
    profitKRW,
    tax,
    afterTaxProfit,
    scenarioValue,
    scenarioProfit,
    scenarioProfitPercent,
  };
}

export function simulateScenario(
  currentPrice: number,
  scenario: Scenario
): number {
  // 각 시나리오의 영향을 백분율로 적용
  let multiplier = 1;
  
  multiplier += scenario.muskRisk / 100;
  multiplier += scenario.trumpPolicy / 100;
  multiplier += scenario.robotaxi / 100;
  
  return currentPrice * multiplier;
}

export function formatCurrency(amount: number, currency: 'USD' | 'KRW' = 'USD'): string {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

