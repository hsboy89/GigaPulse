import { NewsItem } from '../types';

// NewsAPI.org는 무료 티어 제공 (API 키 필요, 하지만 개발 단계에서는 직접 호출도 가능)
// 또는 GNews.io도 무료 API 제공
// 여기서는 NewsAPI.org의 무료 엔드포인트를 사용 (제한적이지만 테스트 가능)

const NEWS_API_KEY = 'YOUR_API_KEY_HERE'; // 실제로는 환경변수로 관리
const NEWS_API_BASE = 'https://newsapi.org/v2/everything';

/**
 * NewsAPI.org를 사용하여 뉴스를 가져옵니다
 * 참고: 무료 티어는 개발/테스트 목적으로만 사용 가능하며, 
 * 프로덕션에서는 유료 플랜 또는 다른 서비스 사용 필요
 */
export async function fetchNewsFromNewsAPI(category: 'tesla' | 'policy' | 'macro' | 'musk'): Promise<NewsItem[]> {
  try {
    // 카테고리별 검색 쿼리
    const queries: Record<string, string> = {
      tesla: 'Tesla OR TSLA',
      policy: 'Trump economic policy electric vehicle',
      macro: 'Federal Reserve interest rate stock market',
      musk: 'Elon Musk',
    };

    const query = queries[category];
    
    // NewsAPI는 CORS를 지원하므로 직접 호출 가능
    // 하지만 무료 티어는 개발 환경에서만 작동하므로, 
    // 실제로는 백엔드를 통하거나 GNews.io 같은 다른 서비스를 사용하는 것이 좋습니다
    const url = `${NEWS_API_BASE}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5`;
    
    // API 키가 없으면 시뮬레이션 데이터 반환
    if (!NEWS_API_KEY || NEWS_API_KEY === 'YOUR_API_KEY_HERE') {
      return [];
    }

    const response = await fetch(url, {
      headers: {
        'X-API-Key': NEWS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return [];
    }

    // NewsAPI 응답을 NewsItem 형식으로 변환
    return data.articles.slice(0, 5).map((article: any, index: number) => {
      const title = article.title || 'No title';
      const description = article.description || article.content || title;
      const content = description.length > 200 ? description.substring(0, 200) + '...' : description;
      
      // 감정 분석 (간단한 키워드 기반)
      const sentiment = analyzeSentiment(title + ' ' + content);
      
      // 영향도 계산
      const impact = calculateImpact(title + ' ' + content, category);

      return {
        id: `${category}-${Date.now()}-${index}`,
        title: title.replace(/<[^>]*>/g, '').trim(),
        content: content.replace(/<[^>]*>/g, '').trim(),
        category,
        timestamp: article.publishedAt || new Date().toISOString(),
        sentiment,
        impact,
      } as NewsItem;
    });
  } catch (error) {
    console.warn(`Error fetching news from NewsAPI for ${category}:`, error);
    return [];
  }
}

/**
 * GNews.io API를 사용하여 뉴스를 가져옵니다 (대안)
 * GNews.io는 무료 티어에서도 CORS를 지원합니다
 */
export async function fetchNewsFromGNews(category: 'tesla' | 'policy' | 'macro' | 'musk'): Promise<NewsItem[]> {
  try {
    const queries: Record<string, string> = {
      tesla: 'Tesla',
      policy: 'Trump economic policy',
      macro: 'Federal Reserve',
      musk: 'Elon Musk',
    };

    const query = queries[category];
    // GNews.io API 엔드포인트 (무료 티어 사용)
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=YOUR_GNEWS_API_KEY`;
    
    // API 키가 없으면 빈 배열 반환
    if (!url.includes('YOUR_GNEWS_API_KEY') === false && url.includes('YOUR_GNEWS_API_KEY')) {
      return [];
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return [];
    }

    return data.articles.map((article: any, index: number) => {
      const title = article.title || 'No title';
      const content = article.content || article.description || title;
      const shortContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
      
      const sentiment = analyzeSentiment(title + ' ' + content);
      const impact = calculateImpact(title + ' ' + content, category);

      return {
        id: `${category}-${Date.now()}-${index}`,
        title: title.replace(/<[^>]*>/g, '').trim(),
        content: shortContent.replace(/<[^>]*>/g, '').trim(),
        category,
        timestamp: article.publishedAt || new Date().toISOString(),
        sentiment,
        impact,
      } as NewsItem;
    });
  } catch (error) {
    console.warn(`Error fetching news from GNews for ${category}:`, error);
    return [];
  }
}

/**
 * 모든 카테고리의 뉴스를 가져옵니다
 * 
 * 사용 방법:
 * 1. NewsAPI.org에서 무료 API 키 발급: https://newsapi.org/register
 * 2. 또는 GNews.io에서 무료 API 키 발급: https://gnews.io/
 * 3. 환경 변수로 API 키 설정 (VITE_NEWS_API_KEY 또는 VITE_GNEWS_API_KEY)
 * 4. newsApi.ts 파일에서 API_KEY 상수에 직접 입력 (개발용)
 * 
 * 현재는 API 키가 없으므로 빈 배열을 반환하여 RSS fallback 사용
 */
export async function fetchAllNewsFromAPI(): Promise<NewsItem[]> {
  // 환경 변수에서 API 키 가져오기 (Vite는 VITE_ 접두사 필요)
  const newsApiKey = import.meta.env.VITE_NEWS_API_KEY || NEWS_API_KEY;
  const gnewsApiKey = import.meta.env.VITE_GNEWS_API_KEY;
  
  // API 키가 없으면 빈 배열 반환 (RSS fallback 사용)
  if ((!newsApiKey || newsApiKey === 'YOUR_API_KEY_HERE') && !gnewsApiKey) {
    return [];
  }

  try {
    const categories: Array<'tesla' | 'policy' | 'macro' | 'musk'> = ['tesla', 'policy', 'macro', 'musk'];
    const allNews: NewsItem[] = [];
    
    const promises = categories.map(async (category) => {
      try {
        // GNews.io를 우선 사용 (더 나은 무료 티어)
        if (gnewsApiKey) {
          // GNews API 키를 사용하는 코드는 fetchNewsFromGNews에 추가 필요
          // return await fetchNewsFromGNews(category);
        }
        // NewsAPI 사용
        if (newsApiKey && newsApiKey !== 'YOUR_API_KEY_HERE') {
          return await fetchNewsFromNewsAPI(category);
        }
        return [];
      } catch (error) {
        console.warn(`Failed to fetch news for category ${category}:`, error);
        return [];
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });
    
    return allNews.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.warn('Error fetching all news from API:', error);
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
  
  const categoryWeights = {
    tesla: 1.5,
    musk: 1.2,
    policy: 1.0,
    macro: 0.8,
  };
  
  const weight = categoryWeights[category] || 1.0;
  
  const strongPositive = ['breakthrough', 'record', 'surge', 'soar', 'rally', 'approval', 'success'];
  const positive = ['growth', 'profit', 'gain', 'rise', 'increase', 'up'];
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
  
  return Math.max(-100, Math.min(100, Math.round(impact)));
}

