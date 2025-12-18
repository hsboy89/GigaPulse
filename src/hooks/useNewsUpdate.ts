import { useState, useEffect, useCallback } from 'react';
import { NewsItem, MuskPost, TeslaPrice } from '../types';
import { newsItems as initialNews, muskPosts as initialMuskPosts, currentTeslaPrice as initialPrice } from '../data/initialData';
import { getMarketStatus } from '../utils/marketStatus';
// CORS/프록시 이슈로 인해 CBOE API 호출 비활성화 (시뮬레이션 데이터 사용)
// import { fetchTSLAPriceFromCBOE } from '../utils/cboeApi';
import { fetchAllNewsFromGoogleRSS } from '../utils/googleNewsRss';
import { fetchAllNewsFromAPI } from '../utils/newsApi';

// 새로운 뉴스를 시뮬레이션하기 위한 풀 (실제로는 API에서 가져올 데이터)
const newsPool: Omit<NewsItem, 'id' | 'timestamp'>[] = [
  {
    title: 'EU 테슬라 벌금 검토 중',
    content: 'EU가 테슬라의 배터리 공급망 관련 규제 위반 가능성을 검토 중입니다. 최대 벌금은 매출의 10%에 달할 수 있습니다.',
    category: 'tesla',
    sentiment: 'negative',
    impact: -8,
  },
  {
    title: '테슬라 중국 공장 확장 승인',
    content: '중국 정부가 테슬라 상하이 공장 확장 계획을 승인했습니다. 생산능력이 2배로 증가할 예정입니다.',
    category: 'tesla',
    sentiment: 'positive',
    impact: 12,
  },
  {
    title: '머스크, Neuralink 임상시험 성공 발표',
    content: '일론 머스크가 Neuralink의 뇌 칩 임상시험 성공을 발표했습니다. 테슬라와의 시너지 기대감이 커지고 있습니다.',
    category: 'musk',
    sentiment: 'positive',
    impact: 5,
  },
  {
    title: '트럼프, 전기차 보조금 재검토 발표',
    content: '트럼프 대통령이 IRA 전기차 보조금 제도를 재검토하겠다고 발표했습니다. 테슬라에 부정적 영향이 예상됩니다.',
    category: 'policy',
    sentiment: 'negative',
    impact: -12,
  },
  {
    title: '달러 강세 지속, 기술주 부담',
    content: '달러 인덱스가 6개월 만에 최고치를 기록했습니다. 기술주인 테슬라에 하방 압력으로 작용할 수 있습니다.',
    category: 'macro',
    sentiment: 'negative',
    impact: -5,
  },
  {
    title: '테슬라 에너지, 주거용 배터리 판매 급증',
    content: '테슬라 에너지의 주거용 Powerwall 배터리 판매가 전년 대비 150% 증가했습니다. 새로운 성장 동력으로 부상하고 있습니다.',
    category: 'tesla',
    sentiment: 'positive',
    impact: 8,
  },
];

// 일론 머스크의 실제 트윗 스타일을 반영한 확장된 트윗 풀
const muskPostPool: Omit<MuskPost, 'id' | 'timestamp'>[] = [
  {
    content: '로보택시 네트워크가 곧 현실이 됩니다. FSD V12의 성능이 기대를 초과합니다.',
    summary: 'FSD V12 성능 향상과 로보택시 네트워크 상용화 신호. 매우 긍정적.',
    sentiment: 'positive',
    keywords: ['로보택시', 'FSD', '네트워크'],
  },
  {
    content: '테슬라는 단순한 자동차 회사가 아닙니다. 에너지, AI, 로보틱스의 통합 플랫폼입니다.',
    summary: '테슬라의 비전 재확인. 다양한 사업 확장 의지 표현.',
    sentiment: 'positive',
    keywords: ['에너지', 'AI', '로보틱스'],
  },
  {
    content: 'X의 광고 수익이 전년 대비 30% 증가했습니다. Grok AI가 핵심 동력입니다.',
    summary: 'X 플랫폼의 수익성 개선. AI 기술의 상업화 성공.',
    sentiment: 'neutral',
    keywords: ['X', '광고', 'Grok'],
  },
  {
    content: '테슬라 주식은 장기 투자입니다. 단기 변동성에 흔들리지 마세요.',
    summary: '머스크의 장기 투자 철학 강조. 주주 안정화 메시지.',
    sentiment: 'positive',
    keywords: ['테슬라', '주식', '투자'],
  },
  {
    content: 'Cybertruck 생산이 가속화되고 있습니다. 예약 고객들에게 곧 배송될 것입니다.',
    summary: 'Cybertruck 생산 및 배송 일정 긍정적 신호.',
    sentiment: 'positive',
    keywords: ['Cybertruck', '생산', '배송'],
  },
  {
    content: '전기차 충전 인프라가 전 세계적으로 확장되고 있습니다.',
    summary: '테슬라의 글로벌 인프라 확장 계속 진행 중.',
    sentiment: 'positive',
    keywords: ['충전', '인프라', '글로벌'],
  },
  {
    content: 'AI와 자율주행의 미래는 밝습니다. 테슬라가 선도하고 있습니다.',
    summary: 'AI 및 자율주행 기술에 대한 자신감 표현.',
    sentiment: 'positive',
    keywords: ['AI', '자율주행', '미래'],
  },
  {
    content: 'Grok의 성능이 계속 개선되고 있습니다. 더 나은 서비스를 제공하겠습니다.',
    summary: 'Grok AI 개선 지속. X 플랫폼 가치 향상 기대.',
    sentiment: 'positive',
    keywords: ['Grok', 'AI', '서비스'],
  },
  {
    content: '배터리 기술 혁신이 테슬라의 핵심 경쟁력입니다.',
    summary: '배터리 기술 우위 강조. 지속 가능한 경쟁력 확보.',
    sentiment: 'positive',
    keywords: ['배터리', '기술', '혁신'],
  },
  {
    content: '테슬라는 지속 가능한 에너지로의 전환을 가속화하고 있습니다.',
    summary: '환경 친화적 비전 재확인. ESG 가치 강조.',
    sentiment: 'positive',
    keywords: ['지속가능', '에너지', '전환'],
  },
  {
    content: 'X 플랫폼의 사용자 경험이 개선되고 있습니다.',
    summary: 'X 플랫폼 품질 향상. 사용자 만족도 개선 신호.',
    sentiment: 'neutral',
    keywords: ['X', '플랫폼', '사용자'],
  },
  {
    content: 'SpaceX와 테슬라의 시너지가 점점 커지고 있습니다.',
    summary: '머스크 기업 간 협력 강화. 기술 공유 가속화.',
    sentiment: 'positive',
    keywords: ['SpaceX', '테슬라', '시너지'],
  },
];

export function useNewsUpdate() {
  // 초기 데이터를 최신 순으로 정렬
  const sortedInitialNews = [...initialNews].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const sortedInitialMuskPosts = [...initialMuskPosts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const [newsItems, setNewsItems] = useState<NewsItem[]>(sortedInitialNews);
  const [muskPosts, setMuskPosts] = useState<MuskPost[]>(sortedInitialMuskPosts);
  const [teslaPrice, setTeslaPrice] = useState<TeslaPrice>(initialPrice);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [usedNewsIds, setUsedNewsIds] = useState<Set<string>>(new Set());
  const [usedMuskIds, setUsedMuskIds] = useState<Set<string>>(new Set());

  const getRandomNews = useCallback((): NewsItem | null => {
    const availableIndices = newsPool
      .map((_, idx) => idx)
      .filter(idx => !usedNewsIds.has(`news-${idx}`));
    
    if (availableIndices.length === 0) {
      setUsedNewsIds(new Set());
      return null;
    }
    
    const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const news = newsPool[randomIdx];
    
    return {
      ...news,
      id: `news-${Date.now()}-${randomIdx}`,
      timestamp: new Date().toISOString(),
    };
  }, [usedNewsIds]);

  const getRandomMuskPost = useCallback((): MuskPost | null => {
    const availableIndices = muskPostPool
      .map((_, idx) => idx)
      .filter(idx => !usedMuskIds.has(`musk-${idx}`));
    
    if (availableIndices.length === 0) {
      setUsedMuskIds(new Set());
      return null;
    }
    
    const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const post = muskPostPool[randomIdx];
    
    return {
      ...post,
      id: `musk-${Date.now()}-${randomIdx}`,
      timestamp: new Date().toISOString(),
    };
  }, [usedMuskIds]);

  // 뉴스 API에서 뉴스 가져오기 (NewsAPI.org 또는 GNews.io)
  // 방법 A: NewsAPI/GNews.io 사용 (프록시 없이 직접 호출 가능)
  const fetchNewsFromAPI = useCallback(async () => {
    try {
      // NewsAPI 또는 GNews.io에서 뉴스 가져오기
      const apiNews = await fetchAllNewsFromAPI();
      
      // API에서 뉴스를 가져오지 못하면 RSS 시도 (fallback)
      if (apiNews.length === 0) {
        const rssNews = await fetchAllNewsFromGoogleRSS();
        if (rssNews.length > 0) {
          setNewsItems((prev) => {
            const existingTitles = new Set(prev.map(item => item.title.toLowerCase()));
            const newUniqueNews = rssNews.filter(item => !existingTitles.has(item.title.toLowerCase()));
            const updated = [...newUniqueNews, ...prev];
            return updated
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 20);
          });
          setLastUpdate(new Date());
        }
      } else {
        // API에서 뉴스를 성공적으로 가져온 경우
        setNewsItems((prev) => {
          const existingTitles = new Set(prev.map(item => item.title.toLowerCase()));
          const newUniqueNews = apiNews.filter(item => !existingTitles.has(item.title.toLowerCase()));
          const updated = [...newUniqueNews, ...prev];
          return updated
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20);
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      // 에러는 조용히 무시 (기존 시뮬레이션 데이터 계속 사용)
    }
  }, []);

  const updateNews = useCallback(() => {
    // NewsAPI/GNews.io에서 뉴스 가져오기 (주기적으로 업데이트)
    fetchNewsFromAPI();
    
    // 기존 시뮬레이션 방식은 백업으로 유지 (RSS 실패 시)
    if (Math.random() < 0.1) {
      const newNews = getRandomNews();
      if (newNews) {
        setNewsItems((prev) => {
          // 최신 순으로 정렬 (timestamp 기준 내림차순)
          const updated = [newNews, ...prev];
          return updated
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20); // 최대 20개 유지
        });
        // ID에서 poolIdx 추출 (news-timestamp-poolIdx 형식)
        const parts = newNews.id.split('-');
        if (parts.length >= 3) {
          const poolIdx = parseInt(parts[parts.length - 1]);
          if (!isNaN(poolIdx)) {
            setUsedNewsIds((prev) => new Set([...prev, `news-${poolIdx}`]));
          }
        }
      }
    }

    // 랜덤하게 새 머스크 포스트 추가 (60% 확률 - 머스크는 자주 트윗함)
    if (Math.random() < 0.6) {
      const newPost = getRandomMuskPost();
      if (newPost) {
        setMuskPosts((prev) => {
          // 최신 순으로 정렬 (timestamp 기준 내림차순)
          const updated = [newPost, ...prev];
          return updated
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // 최대 10개 유지
        });
        // ID에서 poolIdx 추출 (musk-timestamp-poolIdx 형식)
        const parts = newPost.id.split('-');
        if (parts.length >= 3) {
          const poolIdx = parseInt(parts[parts.length - 1]);
          if (!isNaN(poolIdx)) {
            setUsedMuskIds((prev) => new Set([...prev, `musk-${poolIdx}`]));
          }
        }
      }
    }

    // 주가 데이터 업데이트 (TradingView 위젯은 시각적 표시만 제공)
    // 마켓 상태에 따라 가격을 미세 조정하여 실시간감 부여
    setTeslaPrice((prev) => {
      const now = new Date();
      const marketStatus = getMarketStatus(now);
      const prevMarketStatus = prev.marketStatus;
      
      // closePrice는 전일 종가로 하루 종일 동일하게 유지
      const newClosePrice = prev.closePrice;
      
      // 마켓이 열려있으면 가격 미세 조정, 닫혀있으면 종가 사용
      let newPrice = prev.current;
      let newPreviousMarketClose = prev.previousMarketClose;
      
      if (marketStatus !== 'closed') {
        // 마켓이 열려있을 때: 종가 기준 ±3% 범위 내에서 미세 변동
        const change = (Math.random() - 0.5) * 0.8; // -0.4 ~ +0.4 범위
        const minPrice = prev.closePrice * 0.97;
        const maxPrice = prev.closePrice * 1.03;
        newPrice = Math.max(minPrice, Math.min(maxPrice, prev.current + change));
      } else {
        // 마켓이 닫혀있을 때: 종가 사용
        newPrice = newClosePrice;
      }
      
      // 마켓 세그먼트가 변경되었을 때 이전 세그먼트 종료 가격 저장
      if (prevMarketStatus !== marketStatus) {
        if (prevMarketStatus === 'closed' && marketStatus === 'premarket') {
          newPreviousMarketClose = prev.closePrice;
        } else if (prevMarketStatus === 'premarket' && marketStatus === 'daymarket') {
          newPreviousMarketClose = prev.current;
        } else if (prevMarketStatus === 'daymarket' && marketStatus === 'aftermarket') {
          newPreviousMarketClose = prev.current;
        } else if (prevMarketStatus === 'aftermarket' && marketStatus === 'closed') {
          newPreviousMarketClose = prev.current;
        }
      }
      
      // 변동률은 항상 전일 종가(closePrice) 기준으로 계산
      const newChange = newPrice - newClosePrice;
      const newChangePercent = newClosePrice > 0 ? (newChange / newClosePrice) * 100 : 0;
      
      // 고가/저가 업데이트 (마켓이 열려있을 때만)
      const newHigh = marketStatus !== 'closed' ? Math.max(prev.high, newPrice) : prev.high;
      const newLow = marketStatus !== 'closed' ? Math.min(prev.low, newPrice) : prev.low;

      return {
        ...prev,
        current: newPrice,
        closePrice: newClosePrice,
        previousMarketClose: newPreviousMarketClose,
        change: newChange,
        changePercent: newChangePercent,
        high: newHigh,
        low: newLow,
        marketStatus,
        timestamp: now.toISOString(),
      };
    });

    setLastUpdate(new Date());
  }, [getRandomNews, getRandomMuskPost]);

  // CBOE 데이터를 통한 실시간 주가 가져오기
  // CBOE는 나스닥과 유사한 데이터를 제공하면서도 더 빠른 업데이트 속도를 제공합니다
  // CORS/프록시 이슈로 인해 현재 비활성화 (시뮬레이션 데이터 사용)
  /*
  const fetchRealTimePrice = useCallback(async () => {
    try {
      const priceData = await fetchTSLAPriceFromCBOE();
      if (priceData) {
        setTeslaPrice((prev) => {
          // 종가는 전일 종가로 고정 (하루 종일 동일)
          // 새로운 데이터의 종가가 현재 종가와 다르면 (다음 거래일 시작) 업데이트
          const newClosePrice = prev.closePrice !== priceData.closePrice && 
                                priceData.closePrice > 0 
                                ? priceData.closePrice 
                                : prev.closePrice;
          
          // previousMarketClose는 마켓 세그먼트 변경 시에만 업데이트 (updateNews에서 처리)
          return {
            ...priceData,
            closePrice: newClosePrice,
            previousMarketClose: prev.previousMarketClose,
            marketStatus: getMarketStatus(),
          };
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      // CBOE API 실패는 조용히 무시 (기존 가격 데이터 유지)
    }
  }, []);
  */

  useEffect(() => {
    // 초기 실행 (컴포넌트 마운트 시 즉시 실행)
    fetchNewsFromAPI(); // NewsAPI/GNews.io에서 초기 뉴스 가져오기
    updateNews();
    // CBOE API는 CORS/프록시 이슈로 인해 비활성화 (시뮬레이션 데이터 사용)
    // fetchRealTimePrice(); // CBOE 데이터로 실시간 주가 가져오기
    
    // 주가 업데이트: 시뮬레이션 데이터만 사용 (CBOE API 비활성화)
    // const priceInterval = setInterval(() => {
    //   fetchRealTimePrice();
    // }, 30000);
    
    // 뉴스 업데이트: 1분마다 NewsAPI/GNews.io에서 가져오기
    const newsApiInterval = setInterval(() => {
      fetchNewsFromAPI();
    }, 60000); // 1분마다 뉴스 API 업데이트
    
    // 뉴스 및 트윗 업데이트: 1분마다 체크 (시뮬레이션 백업)
    const newsInterval = setInterval(() => {
      updateNews();
    }, 60000); // 1분마다 체크

    return () => {
      // clearInterval(priceInterval);
      clearInterval(newsApiInterval);
      clearInterval(newsInterval);
    };
  }, [updateNews, fetchNewsFromAPI]);

  return {
    newsItems,
    muskPosts,
    teslaPrice,
    lastUpdate,
  };
}

