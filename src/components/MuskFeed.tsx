import { useEffect, useRef } from 'react';

export default function MuskFeed() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetLoadedRef = useRef<boolean>(false); // 위젯이 이미 로드되었는지 추적

  // X 위젯 로드 함수 (최신 트윗을 위해 매번 새로 생성)
  const loadTwitterWidget = (forceRefresh = false) => {
    if (!window.twttr || !widgetRef.current) return;

    // 위젯 생성 함수
    const createWidget = () => {
      if (!window.twttr || !widgetRef.current) return;

      window.twttr.widgets
        .createTimeline(
          {
            sourceType: 'profile',
            screenName: 'elonmusk',
            height: 600,
            width: '100%',
            theme: 'dark',
            tweetLimit: 20,
            chrome: 'noheader nofooter', // 헤더/푸터 제거로 더 많은 트윗 표시
          } as any,
          widgetRef.current
        )
        .then(() => {
          widgetLoadedRef.current = true;
          console.log('✅ X 위젯 로드 완료 - 최신 트윗 표시 중', new Date().toLocaleTimeString());
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
    };

    // 기존 위젯이 있으면 완전히 제거 (최신 트윗을 위해)
    if (forceRefresh && widgetRef.current.innerHTML) {
      // 모든 자식 요소 제거
      while (widgetRef.current.firstChild) {
        widgetRef.current.removeChild(widgetRef.current.firstChild);
      }
      widgetRef.current.innerHTML = '';
      widgetLoadedRef.current = false;
      
      // DOM 정리 시간을 확보한 후 새 위젯 생성
      setTimeout(createWidget, 150);
    } else {
      // 초기 로드 시 즉시 생성
      createWidget();
    }
  };

  // 초기 위젯 로드
  useEffect(() => {
    // X (Twitter) Widgets JS가 로드될 때까지 대기
    const initWidget = () => {
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
    };

    initWidget();
  }, []);

  // 1분마다 위젯 새로고침 (주가 업데이트와 동기화)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (window.twttr && widgetRef.current) {
        // 위젯을 강제로 새로고침하여 최신 트윗 가져오기
        // forceRefresh=true로 설정하여 기존 위젯을 완전히 제거하고 새로 생성
        console.log('🔄 X 위젯 새로고침 중... (최신 트윗 가져오기)', new Date().toLocaleTimeString());
        loadTwitterWidget(true);
      }
    }, 60000); // 1분마다 새로고침 (주가 업데이트와 동기화)

    return () => clearInterval(refreshInterval);
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

