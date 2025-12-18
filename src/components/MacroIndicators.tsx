import { MacroIndicator } from '../types';
import { macroIndicators } from '../data/initialData';

export default function MacroIndicators() {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-400';
      case 'down':
        return 'text-tesla-green';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
        📊 거시 경제 지표
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {macroIndicators.map((indicator, idx) => (
          <div
            key={idx}
            className="bg-gray-900 rounded-lg p-3 border border-gray-700"
          >
            <div className="text-xs text-gray-400 mb-1">{indicator.name}</div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-lg font-bold text-white">
                  {indicator.value.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 ml-1">
                  {indicator.unit}
                </span>
              </div>
              <div className={`text-sm font-semibold ${getTrendColor(indicator.trend)}`}>
                <span className="mr-1">{getTrendIcon(indicator.trend)}</span>
                {indicator.changePercent >= 0 ? '+' : ''}
                {indicator.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

