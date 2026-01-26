import { NewsItem, TeslaPrice } from '../types';

export interface AIIntelligence {
    investmentTemperature: number; // 0-100
    investmentLabel: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    aiSummary: string;
    keyDrivers: {
        title: string;
        impact: number;
        sentiment: 'positive' | 'negative' | 'neutral';
    }[];
    technicalSignals: {
        rsi: number;
        maStatus: 'Bullish' | 'Bearish' | 'Neutral';
        signal: 'Buy' | 'Sell' | 'Neutral';
    };
}

/**
 * 뉴스 데이터와 주가 데이터를 분석하여 지능형 투자 인사이트를 생성합니다.
 */
export function calculateIntelligence(
    newsItems: NewsItem[],
    teslaPrice: TeslaPrice
): AIIntelligence {
    // 1. 뉴스 감성 분석 및 투자 온도 계산
    const relevantNews = newsItems.slice(0, 10);
    const totalImpact = relevantNews.reduce((acc, item) => acc + item.impact, 0);

    // 기본 온도는 50 (중립), 영향도에 따라 -50 ~ +50 변동
    let temperature = 50 + (totalImpact / 2);
    temperature = Math.max(0, Math.min(100, temperature));

    // 투자 라벨 결정
    let label: AIIntelligence['investmentLabel'] = 'Hold';
    if (temperature > 80) label = 'Strong Buy';
    else if (temperature > 60) label = 'Buy';
    else if (temperature < 20) label = 'Strong Sell';
    else if (temperature < 40) label = 'Sell';

    // 2. 핵심 동인 (Key Drivers) 추출
    const keyDrivers = [...relevantNews]
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 3)
        .map(item => ({
            title: item.title,
            impact: item.impact,
            sentiment: item.sentiment
        }));

    // 3. 기술적 지표 시뮬레이션 (현재 주가 변동 기준)
    // 실제 과거 데이터가 없으므로 현재 변동률을 바탕으로 그럴듯한 지표 생성
    const changePercent = teslaPrice.changePercent;

    // RSI 시뮬레이션: 상승 시 RSI 증가, 하락 시 감소 (기본 50)
    let simulatedRsi = 50 + (changePercent * 5);
    simulatedRsi = Math.max(10, Math.min(90, simulatedRsi));

    // MA 상태: 변동률이 양수면 Bullish, 음수면 Bearish
    const maStatus = changePercent > 0.5 ? 'Bullish' : changePercent < -0.5 ? 'Bearish' : 'Neutral';

    // 기술적 신호
    let technicalSignal: AIIntelligence['technicalSignals']['signal'] = 'Neutral';
    if (simulatedRsi < 30 || (changePercent > 1 && maStatus === 'Bullish')) technicalSignal = 'Buy';
    else if (simulatedRsi > 70 || (changePercent < -1 && maStatus === 'Bearish')) technicalSignal = 'Sell';

    // 4. AI 한줄 요약 생성
    let aiSummary = '';
    const topNews = keyDrivers[0];

    if (topNews) {
        if (topNews.sentiment === 'positive') {
            aiSummary = `"${topNews.title}" 호재가 시장을 주도하며 긍정적인 흐름을 보이고 있습니다.`;
        } else if (topNews.sentiment === 'negative') {
            aiSummary = `"${topNews.title}" 리스크로 인해 투자 심리가 위축된 상태입니다. 주의가 필요합니다.`;
        } else {
            aiSummary = `현재 시장은 주요 뉴스들 사이에서 방향성을 탐색하며 중립적인 흐름을 유지하고 있습니다.`;
        }
    } else {
        aiSummary = '현재 테슬라 관련 주요 뉴스가 없어 시장의 흐름을 관망 중입니다.';
    }

    return {
        investmentTemperature: Math.round(temperature),
        investmentLabel: label,
        aiSummary,
        keyDrivers,
        technicalSignals: {
            rsi: Math.round(simulatedRsi),
            maStatus,
            signal: technicalSignal
        }
    };
}
