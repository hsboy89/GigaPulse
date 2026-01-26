// 여러 CORS 프록시 URL (fallback 목록)
export const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
];

/**
 * 여러 프록시를 시도하여 데이터를 가져옵니다.
 */
export async function fetchWithProxy(url: string): Promise<any> {
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxy = CORS_PROXIES[i];
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃

            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json, */*',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn(`Proxy ${proxy} returned status ${response.status}`);
                continue;
            }

            const text = await response.text();

            // JSON 파싱 시도 (Yahoo Finance API는 항상 JSON을 반환)
            try {
                const json = JSON.parse(text);
                console.log(`✅ 프록시 ${proxy} 성공`);
                return json;
            } catch {
                // JSON이 아닌 경우 텍스트 반환 (RSS 등)
                if (text.length > 100) {
                    return text;
                }
                continue;
            }
        } catch (error) {
            console.warn(`Proxy ${proxy} failed for ${url}:`, error);
            continue;
        }
    }
    throw new Error(`All proxies failed for ${url}`);
}
