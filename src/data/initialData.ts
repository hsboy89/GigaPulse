import { TeslaPrice, NewsItem, MuskPost, MacroIndicator, FearGreedIndex } from '../types';
import { getMarketStatus } from '../utils/marketStatus';

// 전일 종가 (하루 종일 고정) - TradingView 위젯과 동기화 필요
const baseClosePrice = 467.00; // 실제 전일 종가 (TradingView 기준)
const initialCurrentPrice = 467.00; // 초기 현재가 (시뮬레이션용, 종가와 동일하게 시작)

export const currentTeslaPrice: TeslaPrice = {
  current: initialCurrentPrice,
  closePrice: baseClosePrice, // 전일 종가 (하루 종일 고정, 변경되지 않음)
  previousMarketClose: baseClosePrice,  // 이전 마켓 세그먼트 종료 가격 (초기값은 전일 종가와 동일)
  change: initialCurrentPrice - baseClosePrice, // 현재가 - 전일 종가
  changePercent: baseClosePrice > 0 ? ((initialCurrentPrice - baseClosePrice) / baseClosePrice) * 100 : 0,
  high: 470.00, // 일일 고가 (시뮬레이션용)
  low: 465.00,  // 일일 저가 (시뮬레이션용)
  volume: 125000000,
  timestamp: new Date().toISOString(),
  marketStatus: getMarketStatus(),
};

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'X(Twitter) 브랜드 사수 소송',
    content: '머스크가 Operation Bluebird라는 스타트업의 Twitter 상표권 탈취 시도에 대해 소송을 제기했습니다. 이는 X의 법적/브랜드 리스크 관리 차원에서 중요합니다.',
    category: 'musk',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    impact: 5,
  },
  {
    id: '2',
    title: 'Grok 랭킹 시스템 변경',
    content: 'X의 피드가 시간순이 아닌 Grok AI 기반 추천순으로 기본 설정되었습니다. 머스크의 발언 파급력이 더 커질 수 있는 구조입니다.',
    category: 'musk',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sentiment: 'neutral',
    impact: 0,
  },
  {
    id: '3',
    title: '트럼프 밤사이 경제 연설 예정',
    content: '트럼프 대통령이 지지율 하락(30%대)을 방어하기 위해 오늘 밤 경제 연설을 합니다. "에너지 가격 하락"과 "관세 강화" 언급이 테슬라 공급망에 미칠 영향이 핵심입니다.',
    category: 'policy',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentiment: 'negative',
    impact: -10,
  },
  {
    id: '4',
    title: '연준 금리 인하 전망 축소',
    content: '연준(Fed)이 2025년 금리 인하 횟수를 4회에서 2회로 줄이겠다고 예고하면서 시장이 조정을 받고 있습니다. 테슬라 4%대 하락 요인입니다.',
    category: 'macro',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    sentiment: 'negative',
    impact: -15,
  },
  {
    id: '5',
    title: '오스틴 로보택시 무인 테스트 성공',
    content: '오스틴에서 운전자 없는 로보택시 테스트가 성공적으로 진행되었습니다. 이는 로보택시 상용화의 중요한 마일스톤입니다.',
    category: 'tesla',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    impact: 20,
  },
  {
    id: '6',
    title: '테슬라 사상 최고가 달성',
    content: '어제 테슬라가 사상 최고가 $489.88를 찍었으나 현재 $467.22까지 조정되었습니다. 오스틴 로보택시 테스트 호재에도 매크로 우려가 주가를 누르고 있습니다.',
    category: 'tesla',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    sentiment: 'neutral',
    impact: 0,
  },
];

export const muskPosts: MuskPost[] = [
  {
    id: 'm1',
    content: 'Twitter 브랜드는 죽지 않았다. Operation Bluebird 소송 개시.',
    summary: 'X(Twitter) 브랜드 가치 수호를 위한 법적 대응 개시. 긍정적 신호.',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    keywords: ['Twitter', '브랜드', '소송'],
  },
  {
    id: 'm2',
    content: 'Grok 피드 알고리즘이 이제 기본 설정입니다. 더 나은 콘텐츠를 보실 수 있습니다.',
    summary: 'X 플랫폼의 AI 기반 추천 시스템 강화. 플랫폼 가치 향상 기대.',
    timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    sentiment: 'neutral',
    keywords: ['Grok', '알고리즘', 'AI'],
  },
];

export const macroIndicators: MacroIndicator[] = [
  {
    name: '미 10년물 국채 금리',
    value: 4.18,
    change: 0.03,
    changePercent: 0.72,
    unit: '%',
    trend: 'up',
  },
  {
    name: '달러 인덱스 (DXY)',
    value: 104.82,
    change: 0.45,
    changePercent: 0.43,
    unit: '',
    trend: 'up',
  },
  {
    name: 'WTI 유가',
    value: 72.45,
    change: -1.23,
    changePercent: -1.67,
    unit: '$/배럴',
    trend: 'down',
  },
  {
    name: '비트코인',
    value: 43250,
    change: -850,
    changePercent: -1.93,
    unit: '$',
    trend: 'down',
  },
];

export const fearGreedIndex: FearGreedIndex = {
  value: 45,
  label: 'Fear',
  category: 'Fear',
};

