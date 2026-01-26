import { FearGreedIndex } from '../types';

interface FearGreedProps {
  index: FearGreedIndex;
}

export default function FearGreedIndexComponent({ index }: FearGreedProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Extreme Fear':
        return 'text-red-500';
      case 'Fear':
        return 'text-orange-400';
      case 'Neutral':
        return 'text-yellow-400';
      case 'Greed':
        return 'text-green-400';
      case 'Extreme Greed':
        return 'text-tesla-green';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'Extreme Fear':
        return 'bg-red-500/20 border-red-500';
      case 'Fear':
        return 'bg-orange-500/20 border-orange-400';
      case 'Neutral':
        return 'bg-yellow-500/20 border-yellow-400';
      case 'Greed':
        return 'bg-green-500/20 border-green-400';
      case 'Extreme Greed':
        return 'bg-tesla-green/20 border-tesla-green';
      default:
        return 'bg-gray-500/20 border-gray-400';
    }
  };

  const getGaugeColor = (value: number) => {
    if (value <= 25) return 'bg-red-500';
    if (value <= 45) return 'bg-orange-400';
    if (value <= 55) return 'bg-yellow-400';
    if (value <= 75) return 'bg-green-400';
    return 'bg-tesla-green';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 h-full">
      <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
        🙌 Fear & Greed 지수
      </h2>

      <div className={`p-4 rounded-lg border ${getCategoryBgColor(index.category)}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`text-3xl font-bold ${getCategoryColor(index.category)}`}>
              {index.value}
            </div>
            <div className={`text-sm font-semibold ${getCategoryColor(index.category)} mt-1`}>
              {index.label}
            </div>
          </div>
        </div>

        {/* 게이지 바 */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full ${getGaugeColor(index.value)} transition-all duration-1000 ease-out`}
            style={{ width: `${index.value}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
          <span>Extreme Fear (0)</span>
          <span>Neutral (50)</span>
          <span>Extreme Greed (100)</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        테슬라 투자자들의 현재 심리 상태를 나타냅니다.
      </div>
    </div>
  );
}
