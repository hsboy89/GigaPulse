import { TeslaPrice } from '../types';
import { getMarketStatus } from './marketStatus';

/**
 * TradingView Symbol Overview API를 통해 TSLA 주가 데이터를 가져옵니다
 * TradingView의 공개 API를 사용하여 실시간 데이터를 가져옵니다
 */
export async function fetchTSLAPriceFromTradingView(): Promise<TeslaPrice | null> {
  try {
    // TradingView Symbol Overview API endpoint
    // 이 API는 TradingView 위젯이 사용하는 데이터 소스입니다
    const symbol = 'NASDAQ:TSLA';
    const url = `https://symbol-search.tradingview.com/symbol_search/?text=${symbol}&exchange=NASDAQ&search_type=undefined&domain=production&sort_by_country=US`;
    
    // TradingView의 실제 데이터 API 사용
    // 대안: TradingView의 데이터 피드 직접 호출
    const dataUrl = `https://scanner.tradingview.com/nasdaq/scan`;
    
    // 또는 TradingView Symbol API 직접 사용
    const symbolDataUrl = `https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d`;
    
    // CORS 문제로 인해 프록시 사용 (개발용)
    // 프로덕션에서는 백엔드나 서버리스 함수를 통해 호출하는 것이 좋습니다
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(symbolDataUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // TradingView/Yahoo Finance API 응답 구조 확인
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.error('Invalid API response structure:', data);
      return null;
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
    const high = meta.regularMarketDayHigh || meta.chartPreviousClose || currentPrice;
    const low = meta.regularMarketDayLow || meta.chartPreviousClose || currentPrice;
    const volume = meta.regularMarketVolume || 0;
    
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    
    const teslaPrice: TeslaPrice = {
      current: currentPrice,
      closePrice: previousClose, // 전일 종가
      previousMarketClose: previousClose,
      change: change,
      changePercent: changePercent,
      high: high,
      low: low,
      volume: volume,
      timestamp: new Date().toISOString(),
      marketStatus: getMarketStatus(),
    };
    
    return teslaPrice;
  } catch (error) {
    console.error('Error fetching TSLA price from TradingView:', error);
    return null;
  }
}

/**
 * TradingView Widget의 데이터를 추출하는 대안 방법
 * 위젯이 로드된 후 iframe 내부의 데이터를 읽으려 시도 (복잡하고 안정적이지 않음)
 */
export function extractPriceFromTradingViewWidget(): Promise<TeslaPrice | null> {
  return new Promise((resolve) => {
    // TradingView 위젯은 iframe으로 렌더링되므로 직접 접근이 어렵습니다
    // 이 방법은 실용적이지 않으므로 다른 API를 사용하는 것이 좋습니다
    resolve(null);
  });
}

