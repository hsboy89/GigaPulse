import { TeslaPrice, NewsItem, MacroIndicator } from '../types';
import { getMarketStatus } from './marketStatus';
import { fetchWithProxy } from './fetchUtils';

/**
 * Finnhub API를 통해 TSLA 실시간 주가 데이터를 가져옵니다
 * 무료 플랜에서 실시간 주가(L1 데이터)를 제공합니다.
 * API 키는 환경 변수 VITE_FINNHUB_API_KEY로 설정하거나 직접 입력할 수 있습니다.
 */
export async function fetchTSLAPriceFromFinnhub(): Promise<TeslaPrice | null> {
  try {
    // Finnhub API 키 (.env 파일의 VITE_FINNHUB_API_KEY 사용)
    // 중요: API 키는 .env 파일에만 저장하고 코드에는 포함하지 않음
    // @ts-ignore - Vite 환경 변수 타입 정의
    const envKey = import.meta.env.VITE_FINNHUB_API_KEY;

    // 로컬 개발 환경에서만 기본값 사용 (프로덕션에서는 환경 변수 필수)
    // @ts-ignore
    const isDev = import.meta.env.DEV;
    const FINNHUB_API_KEY = envKey || (isDev ? 'd51p8cpr01qiituq8gbgd51p8cpr01qiituq8gc0' : null);

    if (!FINNHUB_API_KEY) {
      console.log('Finnhub API Key가 설정되지 않았습니다. 시뮬레이션 데이터를 사용합니다.');
      return null;
    }

    // 환경 변수가 로드되었는지 확인 (개발 환경에서만)
    if (!envKey && isDev) {
      console.log('⚠️ 환경 변수가 로드되지 않아 기본값을 사용합니다. 서버를 재시작하세요.');
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=TSLA&token=${FINNHUB_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Finnhub API 응답 구조: { c: current price, h: high, l: low, o: open, pc: previous close, t: timestamp }
    if (!data || typeof data.c !== 'number') {
      throw new Error('Invalid data returned from Finnhub API');
    }

    const currentPrice = data.c; // Current price (실시간 가격)
    // pc (previous close)가 없거나 유효하지 않으면 에러 처리 (현재가를 종가로 사용하지 않음)
    if (typeof data.pc !== 'number' || data.pc <= 0) {
      throw new Error('Invalid previous close price from Finnhub API');
    }
    const previousClose = data.pc; // Previous close price (전일 종가) - 필수값
    const high = typeof data.h === 'number' && data.h > 0 ? data.h : currentPrice; // High price of the day
    const low = typeof data.l === 'number' && data.l > 0 ? data.l : currentPrice; // Low price of the day


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
      volume: 0, // Finnhub quote API는 volume을 제공하지 않음
      timestamp: new Date().toISOString(),
      marketStatus: getMarketStatus(),
    };

    return teslaPrice;
  } catch (error) {
    console.error('Error fetching TSLA price from Finnhub:', error);
    return null;
  }
}

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
 * Yahoo Finance를 통해 TSLA 실시간 주가 데이터를 가져옵니다 (폴백용)
 */
export async function fetchTSLAPriceSimple(): Promise<TeslaPrice | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=TSLA`;
    const responseData = await fetchWithProxy(url);

    if (!responseData || !responseData.quoteResponse || !responseData.quoteResponse.result || responseData.quoteResponse.result.length === 0) {
      throw new Error('No data returned from Yahoo Finance');
    }

    const quote = responseData.quoteResponse.result[0];

    // Yahoo Finance는 다양한 필드명을 사용하므로 안전하게 추출
    const currentPrice = quote.regularMarketPrice || quote.postMarketPrice || quote.preMarketPrice || quote.previousClose || 0;
    const previousClose = quote.regularMarketPreviousClose || quote.previousClose || currentPrice;
    const high = quote.regularMarketDayHigh || quote.high || currentPrice;
    const low = quote.regularMarketDayLow || quote.low || currentPrice;
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

    console.log('✅ Yahoo Finance에서 주가 데이터를 가져왔습니다:', currentPrice);
    return teslaPrice;
  } catch (error) {
    console.error('Error fetching TSLA price (simple):', error);
    return null;
  }
}

/**
 * Finnhub API를 통해 TSLA 관련 최신 뉴스를 가져옵니다
 * 무료 플랜에서 최근 1년간의 뉴스를 제공합니다.
 * API 키는 환경 변수 VITE_FINNHUB_API_KEY로 설정하거나 직접 입력할 수 있습니다.
 */
export async function fetchTSLANewsFromFinnhub(): Promise<NewsItem[]> {
  try {
    // Finnhub API 키 (.env 파일의 VITE_FINNHUB_API_KEY 사용)
    // @ts-ignore - Vite 환경 변수 타입 정의
    const envKey = import.meta.env.VITE_FINNHUB_API_KEY;

    // @ts-ignore
    const isDev = import.meta.env.DEV;
    const FINNHUB_API_KEY = envKey || (isDev ? 'd51p8cpr01qiituq8gbgd51p8cpr01qiituq8gc0' : null);

    if (!FINNHUB_API_KEY) {
      console.log('Finnhub API Key가 설정되지 않았습니다. RSS 피드를 시도합니다.');
      return [];
    }

    // 오늘 날짜와 7일 전 날짜 계산 (최근 7일간의 뉴스)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fromDate = formatDate(sevenDaysAgo);
    const toDate = formatDate(today);

    const url = `https://finnhub.io/api/v1/company-news?symbol=TSLA&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Finnhub API 응답은 배열 형태
    if (!Array.isArray(data)) {
      console.warn('Finnhub News API가 예상한 형식의 데이터를 반환하지 않았습니다.');
      return [];
    }

    // 뉴스 데이터를 NewsItem 형식으로 변환
    const newsItems: NewsItem[] = data
      .filter((item: any) => item.headline && item.summary) // 제목과 요약이 있는 뉴스만 필터링
      .map((item: any, index: number) => {
        // 카테고리 분류 (제목과 요약 내용 기반)
        let category: 'musk' | 'policy' | 'macro' | 'tesla' = 'tesla';
        const headlineLower = (item.headline || '').toLowerCase();
        const summaryLower = (item.summary || '').toLowerCase();
        const combinedText = `${headlineLower} ${summaryLower}`;

        if (combinedText.includes('musk') || combinedText.includes('elon')) {
          category = 'musk';
        } else if (
          combinedText.includes('policy') ||
          combinedText.includes('trump') ||
          combinedText.includes('government') ||
          combinedText.includes('regulation') ||
          combinedText.includes('subsidy') ||
          combinedText.includes('ira')
        ) {
          category = 'policy';
        } else if (
          combinedText.includes('economy') ||
          combinedText.includes('inflation') ||
          combinedText.includes('fed') ||
          combinedText.includes('interest rate') ||
          combinedText.includes('dollar')
        ) {
          category = 'macro';
        }

        // 감정 분석 (간단한 키워드 기반)
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        const positiveKeywords = ['surge', 'gain', 'rise', 'increase', 'growth', 'success', 'approval', 'breakthrough', 'record'];
        const negativeKeywords = ['fall', 'drop', 'decline', 'loss', 'fine', 'penalty', 'lawsuit', 'concern', 'risk'];

        const positiveCount = positiveKeywords.filter(keyword => combinedText.includes(keyword)).length;
        const negativeCount = negativeKeywords.filter(keyword => combinedText.includes(keyword)).length;

        if (positiveCount > negativeCount) {
          sentiment = 'positive';
        } else if (negativeCount > positiveCount) {
          sentiment = 'negative';
        }

        // 영향도 계산 (간단한 휴리스틱)
        let impact = 0;
        if (sentiment === 'positive') {
          impact = Math.min(20, positiveCount * 3);
        } else if (sentiment === 'negative') {
          impact = Math.max(-20, -negativeCount * 3);
        }

        // Unix timestamp를 ISO string으로 변환
        const timestamp = item.datetime
          ? new Date(item.datetime * 1000).toISOString()
          : new Date().toISOString();

        return {
          id: `finnhub-${item.id || index}-${item.datetime || Date.now()}`,
          title: item.headline || 'No title',
          content: item.summary || item.headline || 'No content',
          category,
          timestamp,
          sentiment,
          impact,
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // 최신순 정렬
      .slice(0, 20); // 최대 20개만 반환

    console.log(`✅ Finnhub에서 ${newsItems.length}개의 테슬라 뉴스를 가져왔습니다.`);
    return newsItems;
  } catch (error) {
    console.error('Error fetching TSLA news from Finnhub:', error);
    return [];
  }
}

/**
 * 거시 경제 지표(국채 금리, 달러 인덱스, 유가, 비트코인)를 가져옵니다.
 */
export async function fetchMacroIndicators(): Promise<MacroIndicator[]> {
  const symbols = [
    { symbol: '^TNX', name: '미 10년물 국채 금리', unit: '%' },
    { symbol: 'DX-Y.NYB', name: '달러 인덱스 (DXY)', unit: '' },
    { symbol: 'CL=F', name: 'WTI 유가', unit: '$/배럴' },
    { symbol: 'BTC-USD', name: '비트코인', unit: '$' },
  ];

  try {
    const fetchPromises = symbols.map(async (item) => {
      try {
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${item.symbol}`;
        const response = await fetchWithProxy(url);

        if (!response || !response.quoteResponse || !response.quoteResponse.result || response.quoteResponse.result.length === 0) {
          throw new Error(`No data for ${item.symbol}`);
        }

        const data = response.quoteResponse.result[0];
        return {
          name: item.name,
          value: data.regularMarketPrice,
          change: data.regularMarketChange,
          changePercent: data.regularMarketChangePercent,
          unit: item.unit,
          trend: data.regularMarketChange >= 0 ? 'up' : 'down',
        } as MacroIndicator;
      } catch (error) {
        console.warn(`Failed to fetch macro indicator ${item.symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    return results.filter((item): item is MacroIndicator => item !== null);
  } catch (error) {
    console.error('Error fetching macro indicators:', error);
    return [];
  }
}
