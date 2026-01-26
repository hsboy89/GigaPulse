import { NewsItem } from '../types';

interface MuskFeedProps {
  newsItems: NewsItem[];
}

export default function MuskFeed({ newsItems }: MuskFeedProps) {
  // Musk 관련 뉴스만 필터링
  const muskNews = newsItems.filter(item =>
    item.category === 'musk' ||
    item.title.toLowerCase().includes('musk') ||
    item.title.toLowerCase().includes('elon')
  );

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-tesla-green';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-tesla-green/10 border-tesla-green/30';
      case 'negative': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-gray-700/30 border-gray-600/30';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-tesla-red flex items-center">
          🚀 Elon's Intelligence
        </h2>
        <span className="text-xs text-gray-400">실시간 뉴스 기반</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 custom-scrollbar">
        {muskNews.length > 0 ? (
          muskNews.map((news) => (
            <div
              key={news.id}
              className={`p-4 rounded-lg border transition-all hover:bg-gray-700/50 ${getSentimentBg(news.sentiment)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getSentimentBg(news.sentiment)} ${getSentimentColor(news.sentiment)}`}>
                  {news.sentiment}
                </span>
                <span className="text-[10px] text-gray-500">
                  {new Date(news.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                {news.title}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                {news.content}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-gray-500">Impact:</span>
                  <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${news.impact >= 0 ? 'bg-tesla-green' : 'bg-red-400'}`}
                      style={{ width: `${Math.abs(news.impact)}%` }}
                    />
                  </div>
                </div>
                <span className={`text-[10px] font-bold ${news.impact >= 0 ? 'text-tesla-green' : 'text-red-400'}`}>
                  {news.impact >= 0 ? '+' : ''}{news.impact}%
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
            <div className="animate-pulse text-4xl">📡</div>
            <p className="text-sm">머스크 관련 뉴스를 수집 중입니다...</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
        <div className="bg-gray-900/50 rounded p-3 text-[11px] text-gray-400 italic">
          "X(Twitter) 위젯 대신 실시간 뉴스 API를 통해 일론 머스크의 행보와 시장 영향을 분석합니다."
        </div>
      </div>
    </div>
  );
}


