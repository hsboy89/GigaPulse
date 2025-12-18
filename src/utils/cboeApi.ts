import { TeslaPrice } from '../types';
import { getMarketStatus } from './marketStatus';

/**
 * CBOE/BATS 데이터를 통해 TSLA 주가를 가져옵니다
 * CBOE는 나스닥과 유사한 데이터를 제공하면서도 더 빠른 업데이트 속도를 제공합니다
 */
export async function fetchTSLAPriceFromCBOE(): Promise<TeslaPrice | null> {
  try {
    // CBOE/BATS는 직접 공개 API가 제한적이므로
    // TradingView가 사용하는 데이터 소스를 통해 접근 시도
    // 또는 Yahoo Finance의 CBOE 데이터 사용
    
    // 방법 1: Yahoo Finance에서 CBOE 데이터 가져오기 (CBOE는 보통 NASDAQ과 동일한 심볼 사용)
    // 방법 2: Alpha Vantage나 다른 무료 API 사용
    // 방법 3: TradingView의 CBOE 데이터 엔드포인트 직접 호출 시도
    
    // TradingView의 CBOE 데이터 엔드포인트 (실제로는 Yahoo Finance를 통해 접근)
    const symbol = 'TSLA';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    
    // CORS 프록시 사용 (프로덕션에서는 백엔드 사용 권장)
    // 여러 프록시를 시도
    const proxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
    ];
    
    let data: any = null;
    let lastError: Error | null = null;
    
    for (const proxy of proxies) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
        
        // 에러를 조용히 처리하기 위해 catch에서 아무것도 하지 않음
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }).catch(() => null); // fetch 실패 시 null 반환
        
        clearTimeout(timeoutId);
        
        if (!response || !response.ok) {
          continue;
        }
        
        const responseData = await response.json().catch(() => null);
        
        if (responseData && responseData.chart && responseData.chart.result && responseData.chart.result.length > 0) {
          data = responseData;
          break;
        }
      } catch (error) {
        // 프록시 실패는 조용히 다음 프록시 시도 (에러 무시)
        continue;
      }
    }
    
    if (!data) {
      // 모든 프록시 실패 시 null 반환 (기존 가격 데이터 유지)
      // CBOE API는 실패해도 TradingView 위젯과 시뮬레이션 데이터로 계속 작동
      return null;
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    
    // 실시간 가격 데이터 추출
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
    // CBOE API 오류는 조용히 처리 (기존 가격 데이터 사용)
    // TradingView 위젯이 시각적으로 가격을 표시하므로 기능에는 영향 없음
    return null;
  }
}

/**
 * 대안: Alpha Vantage API 사용 (무료 티어 제공, API 키 필요)
 * 또는 Finnhub API 사용 (무료 티어 제공)
 */
export async function fetchTSLAPriceAlternative(): Promise<TeslaPrice | null> {
  // 향후 구현: Alpha Vantage나 Finnhub 같은 무료 API 사용
  // 현재는 CBOE 데이터 소스를 우선 사용
  return null;
}

