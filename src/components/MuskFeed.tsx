import { MuskPost } from '../types';

interface MuskFeedProps {
  muskPosts?: MuskPost[];
}

export default function MuskFeed({ muskPosts = [] }: MuskFeedProps) {

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-500';
      case 'negative':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-tesla-red flex items-center">
          🚀 Elon's X Feed
        </h2>
        <span className="text-xs text-gray-400">실시간</span>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {/* Elon Musk X 프로필 링크 버튼 */}
        <a
          href="https://x.com/elonmusk"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 p-4 bg-gradient-to-r from-tesla-red to-pink-600 rounded-lg hover:from-tesla-red hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
        >
          <svg 
            className="w-6 h-6" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>Elon Musk의 최신 트윗 보기</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        
        {/* 시뮬레이션 트윗 데이터 표시 */}
        <div className="space-y-4 flex-1">
          {muskPosts.length > 0 ? (
            muskPosts.map((post) => (
              <div
                key={post.id}
                className={`p-4 rounded-lg border ${getSentimentColor(post.sentiment)} bg-gray-900/50`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🚀</span>
                    <span className="text-xs text-gray-400">Elon Musk</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(post.timestamp)}</span>
                </div>
                
                <p className="text-white mb-2">{post.content}</p>
                
                {post.keywords && post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                )}
                
                {post.summary && (
                  <div className="mt-2 text-xs text-gray-400 italic">{post.summary}</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>트윗 데이터를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

