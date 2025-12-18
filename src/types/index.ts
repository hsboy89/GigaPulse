export type MarketStatus = 'premarket' | 'daymarket' | 'aftermarket' | 'closed';

export interface TeslaPrice {
  current: number;  // 현재가 (마켓 상태에 따라 프리/데이/애프터/종가)
  closePrice: number;  // 전일 종가 (본장 전까지 유지)
  previousMarketClose: number;  // 이전 마켓 세그먼트 종료 가격 (프리/데이/애프터 종료 시점 가격)
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
  marketStatus: MarketStatus;  // 현재 마켓 상태
}

export interface Portfolio {
  shares: number;
  avgPrice: number;
  exchangeRate: number;
}

export interface Scenario {
  muskRisk: number;     // -10 ~ 0
  trumpPolicy: number;  // -15 ~ 25
  robotaxi: number;     // 0 ~ 200
}

export interface PortfolioResult {
  currentValue: number;
  profit: number;
  profitPercent: number;
  profitKRW: number;
  tax: number;
  afterTaxProfit: number;
  scenarioValue: number;
  scenarioProfit: number;
  scenarioProfitPercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'musk' | 'policy' | 'macro' | 'tesla';
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number; // -100 ~ 100
}

export interface MuskPost {
  id: string;
  content: string;
  summary: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}

export interface MacroIndicator {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface FearGreedIndex {
  value: number; // 0-100
  label: string;
  category: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
}

