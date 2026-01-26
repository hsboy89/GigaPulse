// 여러 CORS 프록시 URL (fallback 목록)
export const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-anywhere.herokuapp.com/',
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
            const timeoutId = setTimeout(() => controller.abort(), 12000); // 12초 타임아웃

            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json, application/xml, text/xml, */*',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.warn(`Proxy ${proxy} failed for ${url}:`, error);
            continue;
        }
    }
    throw new Error(`All proxies failed for ${url}`);
}
