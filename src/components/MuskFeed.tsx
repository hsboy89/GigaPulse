import { useEffect, useRef } from 'react';

export default function MuskFeed() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetLoadedRef = useRef<boolean>(false); // 위젯이 이미 로드되었는지 추적

  useEffect(() => {
    // 이미 위젯이 로드되었다면 다시 로드하지 않음 (429 에러 방지)
    if (widgetLoadedRef.current) {
      return;
    }

    // X (Twitter) Widgets JS가 로드될 때까지 대기
    const loadTwitterWidget = () => {
      if (window.twttr && widgetRef.current && !widgetLoadedRef.current) {
        // 위젯이 이미 있는지 확인
        const existingWidget = widgetRef.current.querySelector('iframe, a');
        if (existingWidget) {
          // 이미 위젯이 있으면 로드하지 않음
          widgetLoadedRef.current = true;
          return;
        }

        // Elon Musk의 타임라인 임베드 생성
        // Twitter Widgets API는 동적이므로 타입 단언 사용
        window.twttr.widgets
          .createTimeline(
            {
              sourceType: 'profile',
              screenName: 'elonmusk',
              height: 600,
              width: '100%',
              theme: 'dark',
              tweetLimit: 20,
            } as any,
            widgetRef.current
          )
          .then(() => {
            widgetLoadedRef.current = true;
          })
          .catch((err: Error) => {
            console.error('X widget 로드 실패:', err);
            // 429 에러인 경우 사용자에게 안내 메시지 표시
            if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
              if (widgetRef.current) {
                widgetRef.current.innerHTML = `
                  <div class="p-4 text-center text-gray-400">
                    <p class="mb-2">X 피드를 불러오는 데 너무 많은 요청이 발생했습니다.</p>
                    <p class="text-sm">잠시 후 새로고침해주세요.</p>
                    <a href="https://x.com/elonmusk" target="_blank" rel="noopener noreferrer" 
                       class="mt-4 inline-block px-4 py-2 bg-tesla-red text-white rounded hover:bg-red-700">
                      Elon Musk의 X 프로필 보기
                    </a>
                  </div>
                `;
              }
            }
          });
      }
    };

    // widgets.js가 이미 로드되어 있으면 바로 실행
    if (window.twttr && window.twttr.widgets) {
      loadTwitterWidget();
    } else {
      // widgets.js 로드를 기다림
      let checkCount = 0;
      const maxChecks = 50; // 최대 5초 (100ms * 50)
      
      const checkInterval = setInterval(() => {
        checkCount++;
        if (window.twttr && window.twttr.widgets) {
          clearInterval(checkInterval);
          loadTwitterWidget();
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          console.warn('X widgets.js 로드 타임아웃');
        }
      }, 100);
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 위젯은 유지하되, 재마운트 시 중복 로드 방지
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-tesla-red flex items-center">
          🚀 Elon's X Feed
        </h2>
        <span className="text-xs text-gray-400">실시간</span>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {/* X (Twitter) Embed Widget - Elon Musk 타임라인 */}
        <div 
          ref={widgetRef} 
          className="flex-1 min-h-[600px]"
          style={{ minHeight: '600px' }}
        />
      </div>
    </div>
  );
}

