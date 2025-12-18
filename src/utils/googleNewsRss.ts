import { NewsItem } from '../types';

// 여러 CORS 프록시 URL (fallback 목록)
// 참고: Google News RSS는 브라우저에서 직접 접근이 제한되므로 프록시가 필요합니다
// 일부 프록시는 불안정할 수 있으므로 여러 개를 시도합니다
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

// 카테고리별 Google News RSS 피드 URL
const RSS_FEEDS = {
  tesla: 'https://news.google.com/rss/search?q=Tesla+stock&hl=en-US&gl=US&ceid=US:en',
  policy: 'https://news.google.com/rss/search?q=Trump+Economic+Policy+electric+vehicle&hl=en-US&gl=US&ceid=US:en',
  macro: 'https://news.google.com/rss/search?q=Federal+Reserve+interest+rate+stock+market&hl=en-US&gl=US&ceid=US:en',
  musk: 'https://news.google.com/rss/search?q=Elon+Musk+Tesla&hl=en-US&gl=US&ceid=US:en',
};

/**
 * 여러 프록시를 시도하여 RSS 피드를 가져옵니다
 */
async function fetchWithProxy(url: string): Promise<string> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    try {
      // allorigins.win은 get 엔드포인트를 사용하면 JSON으로 감싸진 응답을 반환
      let proxyUrl: string;
      if (proxy.includes('allorigins.win')) {
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      } else {
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12초 타임아웃
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let text: string;
      
      // allorigins.win의 get 엔드포인트는 JSON으로 감싸진 응답을 반환
      if (proxy.includes('allorigins.win') && proxy.includes('/get')) {
        const json = await response.json();
        text = json.contents || json.content || '';
      } else {
        // 다른 프록시는 직접 텍스트 반환
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        text = decoder.decode(arrayBuffer);
      }
      
      // 응답이 비어있거나 너무 짧으면 다음 프록시 시도
      if (!text || text.length < 100) {
        throw new Error('Empty or invalid response');
      }
      
      // XML 시작 태그 확인
      const trimmedText = text.trim();
      if (!trimmedText.startsWith('<?xml') && !trimmedText.startsWith('<rss')) {
        throw new Error('Invalid XML response');
      }
      
      return text;
    } catch (error) {
      // 모든 에러는 조용히 무시하고 다음 프록시 시도
      if ((error as Error).name !== 'AbortError') {
        lastError = error as Error;
      }
      // 마지막 프록시가 아니면 조용히 다음 프록시 시도
      if (i < CORS_PROXIES.length - 1) {
        continue;
      }
    }
  }
  
  // 모든 프록시 실패 시 조용히 에러 반환 (호출자가 처리)
  throw lastError || new Error('All proxies failed');
}

/**
 * XML 문자열을 파싱하여 RSS 아이템을 추출합니다
 */
function parseRSSXML(xmlString: string): Array<{ title: string; description: string; pubDate: string; link: string }> {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // 파싱 에러 확인
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return [];
    }
    
    const items = xmlDoc.querySelectorAll('item');
    const result: Array<{ title: string; description: string; pubDate: string; link: string }> = [];
    
    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      
      // 제목이 있어야만 추가
      if (title.trim()) {
        result.push({ title, description, pubDate, link });
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing RSS XML:', error);
    return [];
  }
}

/**
 * Google News RSS 피드에서 뉴스를 가져옵니다
 */
export async function fetchNewsFromGoogleRSS(category: 'tesla' | 'policy' | 'macro' | 'musk'): Promise<NewsItem[]> {
  try {
    const feedUrl = RSS_FEEDS[category];
    const xmlText = await fetchWithProxy(feedUrl);
    const items = parseRSSXML(xmlText);
    
    if (items.length === 0) {
      return [];
    }
    
    // 최신 5개만 가져오기
    const newsItems = items.slice(0, 5).map((item, index) => {
      // 제목에서 HTML 태그 제거
      const title = item.title.replace(/<[^>]*>/g, '').trim() || 'No title';
      
      // 설명에서 HTML 태그 제거 및 요약
      let content = item.description.replace(/<[^>]*>/g, '').trim();
      
      // 내용이 너무 길면 자르기
      if (content.length > 200) {
        content = content.substring(0, 200) + '...';
      }
      
      // pubDate를 ISO 형식으로 변환
      let pubDate: string;
      try {
        pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      } catch {
        pubDate = new Date().toISOString();
      }
      
      // 감정 분석 (간단한 키워드 기반)
      const sentiment = analyzeSentiment(title + ' ' + content);
      
      // 영향도 계산 (간단한 키워드 기반)
      const impact = calculateImpact(title + ' ' + content, category);
      
      return {
        id: `${category}-${Date.now()}-${index}`,
        title,
        content: content || title, // 내용이 없으면 제목 사용
        category,
        timestamp: pubDate,
        sentiment,
        impact,
      } as NewsItem;
    });
    
    return newsItems;
  } catch (error) {
    console.error(`Error fetching Google News RSS for ${category}:`, error);
    return [];
  }
}

/**
 * 모든 카테고리의 뉴스를 가져옵니다
 */
export async function fetchAllNewsFromGoogleRSS(): Promise<NewsItem[]> {
  try {
    const categories: Array<'tesla' | 'policy' | 'macro' | 'musk'> = ['tesla', 'policy', 'macro', 'musk'];
    const allNews: NewsItem[] = [];
    
    // 각 카테고리별로 병렬로 가져오기 (실패해도 다른 카테고리는 계속 시도)
    const promises = categories.map(async (category) => {
      try {
        return await fetchNewsFromGoogleRSS(category);
      } catch (error) {
        // 개별 카테고리 실패는 조용히 무시
        console.warn(`Failed to fetch news for category ${category}:`, error);
        return [];
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    // 성공한 결과만 합치기
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });
    
    // 최신 순으로 정렬
    return allNews.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    // 전체 실패 시 빈 배열 반환 (기존 데이터 유지)
    console.warn('Error fetching all news from Google RSS:', error);
    return [];
  }
}

/**
 * 간단한 감정 분석 (키워드 기반)
 */
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  const positiveKeywords = ['success', 'growth', 'profit', 'gain', 'rise', 'up', 'approve', 'win', 'breakthrough', 'surge', 'increase', 'positive', 'good', 'great', 'excellent'];
  const negativeKeywords = ['decline', 'fall', 'drop', 'loss', 'down', 'reject', 'fail', 'crisis', 'worry', 'concern', 'risk', 'negative', 'bad', 'worse', 'problem'];
  
  const positiveCount = positiveKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const negativeCount = negativeKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * 영향도 계산 (키워드 기반)
 */
function calculateImpact(text: string, category: string): number {
  const lowerText = text.toLowerCase();
  let impact = 0;
  
  // 카테고리별 가중치
  const categoryWeights = {
    tesla: 1.5,
    musk: 1.2,
    policy: 1.0,
    macro: 0.8,
  };
  
  const weight = categoryWeights[category] || 1.0;
  
  // 긍정적 키워드
  const strongPositive = ['breakthrough', 'record', 'surge', 'soar', 'rally', 'approval', 'success'];
  const positive = ['growth', 'profit', 'gain', 'rise', 'increase', 'up'];
  
  // 부정적 키워드
  const strongNegative = ['crisis', 'crash', 'plunge', 'reject', 'ban', 'fine', 'lawsuit'];
  const negative = ['decline', 'fall', 'drop', 'loss', 'down', 'worry', 'concern'];
  
  strongPositive.forEach(keyword => {
    if (lowerText.includes(keyword)) impact += 15 * weight;
  });
  
  positive.forEach(keyword => {
    if (lowerText.includes(keyword)) impact += 8 * weight;
  });
  
  strongNegative.forEach(keyword => {
    if (lowerText.includes(keyword)) impact -= 15 * weight;
  });
  
  negative.forEach(keyword => {
    if (lowerText.includes(keyword)) impact -= 8 * weight;
  });
  
  // -100 ~ 100 범위로 제한
  return Math.max(-100, Math.min(100, Math.round(impact)));
}

