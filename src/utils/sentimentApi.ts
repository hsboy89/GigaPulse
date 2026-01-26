import { FearGreedIndex } from '../types';
import { fetchWithProxy } from './fetchUtils';

/**
 * CNN의 Fear & Greed Index 또는 대체 소스에서 데이터를 가져옵니다.
 */
export async function fetchFearGreedIndex(): Promise<FearGreedIndex> {
    try {
        // CNN의 공개 데이터 시각화 엔드포인트 시도 (프록시 사용)
        const url = 'https://production.dataviz.cnn.io/index/feargreed/static';
        const data = await fetchWithProxy(url);

        if (data && data.fear_and_greed) {
            const value = Math.round(data.fear_and_greed.score);
            let label = 'Neutral';
            let category: FearGreedIndex['category'] = 'Neutral';

            if (value <= 25) {
                label = 'Extreme Fear';
                category = 'Extreme Fear';
            } else if (value <= 45) {
                label = 'Fear';
                category = 'Fear';
            } else if (value >= 75) {
                label = 'Extreme Greed';
                category = 'Extreme Greed';
            } else if (value >= 55) {
                label = 'Greed';
                category = 'Greed';
            }

            return {
                value,
                label,
                category,
            };
        }

        // CNN 실패 시 Crypto Fear & Greed Index (Alternative.me) 폴백
        const cryptoUrl = 'https://api.alternative.me/fng/';
        const cryptoData = await fetchWithProxy(cryptoUrl);

        if (cryptoData && cryptoData.data && cryptoData.data.length > 0) {
            const item = cryptoData.data[0];
            const value = parseInt(item.value);
            return {
                value,
                label: item.value_classification,
                category: item.value_classification as any,
            };
        }

        throw new Error('Failed to fetch Fear & Greed index from all sources');
    } catch (error) {
        console.error('Error fetching Fear & Greed index:', error);
        // 에러 시 기본값 반환
        return {
            value: 50,
            label: 'Neutral',
            category: 'Neutral',
        };
    }
}
