import { useEffect, useRef } from 'react';

export default function MuskFeed() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // X (Twitter) Widgets JS가 로드될 때까지 대기
    const loadTwitterWidget = () => {
      if (window.twttr && widgetRef.current) {
        // 기존 위젯이 있다면 제거
        const existingWidget = widgetRef.current.querySelector('iframe');
        if (existingWidget) {
          widgetRef.current.innerHTML = '';
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
          .catch((err: Error) => {
            console.error('X widget 로드 실패:', err);
          });
      }
    };

    // widgets.js가 이미 로드되어 있으면 바로 실행
    if (window.twttr && window.twttr.widgets) {
      loadTwitterWidget();
    } else {
      // widgets.js 로드를 기다림
      const checkInterval = setInterval(() => {
        if (window.twttr && window.twttr.widgets) {
          clearInterval(checkInterval);
          loadTwitterWidget();
        }
      }, 100);

      // 10초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);
    }
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
        >
          {/* 위젯 로딩 중 표시 */}
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesla-red mx-auto mb-2"></div>
              <p>X 피드를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

