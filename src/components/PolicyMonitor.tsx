import { NewsItem } from '../types';

interface PolicyMonitorProps {
  newsItems: NewsItem[];
}

export default function PolicyMonitor({ newsItems }: PolicyMonitorProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'policy':
        return '🇺🇸';
      case 'macro':
        return '📊';
      case 'tesla':
        return '📈';
      case 'musk':
        return '🚀';
      default:
        return '📰';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'policy':
        return '정책';
      case 'macro':
        return '거시경제';
      case 'tesla':
        return '테슬라';
      case 'musk':
        return '머스크';
      default:
        return '뉴스';
    }
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) {
      return '방금 전';
    } else if (hours < 24) {
      return `${hours}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-400';
    if (impact < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-blue-400 flex items-center">
          🇺🇸 Policy & News Monitor
        </h2>
        <span className="text-xs text-gray-400">실시간</span>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border ${getSentimentColor(item.sentiment)} bg-gray-900/50`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(item.category)}</span>
                <span className="text-xs text-gray-400">{getCategoryLabel(item.category)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">{formatTime(item.timestamp)}</span>
                {item.impact !== 0 && (
                  <div className={`text-xs font-bold mt-1 ${getImpactColor(item.impact)}`}>
                    영향도: {item.impact > 0 ? '+' : ''}{item.impact}%
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-white font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

