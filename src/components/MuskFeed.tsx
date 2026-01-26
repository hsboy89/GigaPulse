import { NewsItem } from '../types';

interface MuskFeedProps {
  newsItems: NewsItem[];
  sentiment: { score: number; label: string };
}

export default function MuskFeed({ newsItems, sentiment }: MuskFeedProps) {
  // Musk 관련 뉴스만 필터링
  const muskNews = newsItems.filter(item =>
    item.category === 'musk' ||
    item.title.toLowerCase().includes('musk') ||
    item.title.toLowerCase().includes('elon')
  );
  const getSentimentColor = (sentimentStr: string) => {
    switch (sentimentStr) {
      case 'positive': return 'text-tesla-green';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentBg = (sentimentStr: string) => {
    switch (sentimentStr) {
      case 'positive': return 'bg-tesla-green/10 border-tesla-green/30';
      case 'negative': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-gray-700/30 border-gray-600/30';
    }
  };

  const getGaugeColor = (score: number) => {
    if (score > 70) return 'bg-tesla-green';
    if (score > 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-tesla-red flex items-center">
            🚀 Elon's Intelligence
          </h2>
          <div className="flex items-center space-x-1 bg-gray-900/50 px-2 py-0.5 rounded-full border border-gray-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tesla-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tesla-green"></span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Live Pulse</span>
          </div>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          {new Date().toLocaleTimeString([], { hour12: false })}
        </span>
      </div>

      {/* Sentiment Gauge */}
      <div className="mb-6 bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Musk Sentiment</span>
          <span className={`text-[11px] font-bold ${getSentimentColor(sentiment.label.toLowerCase().includes('positive') ? 'positive' : sentiment.label.toLowerCase().includes('negative') ? 'negative' : 'neutral')}`}>
            {sentiment.label}
          </span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-out ${getGaugeColor(sentiment.score)}`}
            style={{ width: `${sentiment.score}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-gray-600 font-medium">
          <span>BEARISH</span>
          <span>BULLISH</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 custom-scrollbar">
        {muskNews.length > 0 ? (
          muskNews.map((news) => (
            <div
              key={news.id}
              className={`p-4 rounded-lg border transition-all hover:bg-gray-700/50 group ${getSentimentBg(news.sentiment)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getSentimentBg(news.sentiment)} ${getSentimentColor(news.sentiment)}`}>
                  {news.sentiment}
                </span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {new Date(news.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-tesla-red transition-colors">
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
        <div className="bg-gray-900/50 rounded p-3 text-[11px] text-gray-400 italic leading-relaxed">
          "실시간 뉴스 API와 전문 매체(Teslarati, Electrek)의 데이터를 분석하여 일론 머스크의 시장 영향력을 추적합니다."
        </div>
      </div>
    </div>
  );
}
