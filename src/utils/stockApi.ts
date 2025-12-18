import { TeslaPrice } from '../types';
import { getMarketStatus } from './marketStatus';

/**
 * Yahoo Finance API를 통해 TSLA 주가 데이터를 가져옵니다
 * 참고: CORS 문제로 인해 직접 호출이 안될 수 있으므로, 실제 환경에서는 백엔드 프록시나 서버리스 함수를 사용하는 것이 좋습니다.
 */
export async function fetchTSLAPrice(): Promise<TeslaPrice | null> {
  try {
    // Yahoo Finance API endpoint
    // CORS 문제를 우회하기 위해 CORS 프록시 사용 (개발용)
    // 프로덕션에서는 백엔드 API나 서버리스 함수를 통해 호출해야 합니다
    const symbol = 'TSLA';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    
    // CORS 프록시 사용 (프로덕션에서는 제거하고 백엔드 사용)
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data returned from API');
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || currentPrice;
    const high = meta.regularMarketDayHigh || meta.previousClose || currentPrice;
    const low = meta.regularMarketDayLow || meta.previousClose || currentPrice;
    const volume = meta.regularMarketVolume || 0;
    
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    
    const teslaPrice: TeslaPrice = {
      current: currentPrice,
      closePrice: previousClose, // 전일 종가
      previousMarketClose: previousClose, // 초기값은 전일 종가와 동일
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
    console.error('Error fetching TSLA price:', error);
    return null;
  }
}

/**
 * 간단한 폴백 방법: Yahoo Finance의 간단한 쿼리
 * 이 방법은 더 안정적이지만 데이터가 제한적일 수 있습니다
 */
export async function fetchTSLAPriceSimple(): Promise<TeslaPrice | null> {
  try {
    // 여러 CORS 프록시 시도 (fallback 방식)
    const proxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=TSLA`;
    let data: any = null;
    let lastError: Error | null = null;
    
    // 각 프록시를 순차적으로 시도
    for (const proxy of proxies) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          continue; // 다음 프록시 시도
        }
        
        const responseData = await response.json();
        
        // 응답이 올바른 구조인지 확인
        if (responseData && responseData.quoteResponse && responseData.quoteResponse.result && responseData.quoteResponse.result.length > 0) {
          data = responseData;
          break; // 성공적으로 데이터를 가져왔으므로 루프 종료
        }
      } catch (error) {
        lastError = error as Error;
        continue; // 다음 프록시 시도
      }
    }
    
    if (!data) {
      console.error('All proxy attempts failed. Last error:', lastError);
      throw new Error('No data returned from API - all proxies failed');
    }
    
    const quote = data.quoteResponse.result[0];
    const currentPrice = quote.regularMarketPrice || quote.previousClose || 0;
    const previousClose = quote.regularMarketPreviousClose || quote.previousClose || currentPrice;
    const high = quote.regularMarketDayHigh || previousClose;
    const low = quote.regularMarketDayLow || previousClose;
    const volume = quote.regularMarketVolume || 0;
    
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    
    const teslaPrice: TeslaPrice = {
      current: currentPrice,
      closePrice: previousClose,
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
    console.error('Error fetching TSLA price (simple):', error);
    return null;
  }
}

