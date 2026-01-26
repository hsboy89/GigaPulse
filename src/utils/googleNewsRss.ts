import { NewsItem } from '../types';
import { fetchWithProxy } from './fetchUtils';

// 카테고리별 Google News RSS 피드 URL
const RSS_FEEDS = {
  tesla: 'https://news.google.com/rss/search?q=Tesla+stock&hl=en-US&gl=US&ceid=US:en',
  policy: 'https://news.google.com/rss/search?q=Trump+Economic+Policy+electric+vehicle&hl=en-US&gl=US&ceid=US:en',
  macro: 'https://news.google.com/rss/search?q=Federal+Reserve+interest+rate+stock+market&hl=en-US&gl=US&ceid=US:en',
  musk: 'https://news.google.com/rss/search?q=Elon+Musk+Tesla&hl=en-US&gl=US&ceid=US:en',
  musk_special: [
    'https://www.teslarati.com/tag/elon-musk/feed',
    'https://electrek.co/guides/elon-musk/feed',
    'https://nypost.com/tag/elon-musk/feed'
  ]
};

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
    const feedsToFetch: string[] = [];

    if (category === 'musk') {
      feedsToFetch.push(RSS_FEEDS.musk);
      if ((RSS_FEEDS as any).musk_special) {
        feedsToFetch.push(...(RSS_FEEDS as any).musk_special);
      }
    } else {
      feedsToFetch.push(RSS_FEEDS[category]);
    }

    const allFetchedItems: any[] = [];

    // 병렬로 모든 피드 가져오기
    const fetchPromises = feedsToFetch.map(async (url) => {
      try {
        const xmlText = await fetchWithProxy(url);
        return parseRSSXML(xmlText);
      } catch (error) {
        console.warn(`Failed to fetch RSS from ${url}:`, error);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(items => allFetchedItems.push(...items));

    if (allFetchedItems.length === 0) {
      return [];
    }

    // 중복 제거 (제목 기준)
    const uniqueItems = Array.from(new Map(allFetchedItems.map(item => [item.title, item])).values());

    // 최신 순으로 정렬 후 상위 10개만 가져오기 (머스크는 더 많이 가져옴)
    const limit = category === 'musk' ? 15 : 5;
    const newsItems = uniqueItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit)
      .map((item, index) => {
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

  const weight = categoryWeights[category as keyof typeof categoryWeights] || 1.0;

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

