import { TeslaPrice } from '../types';
import { getMarketLabel, getMarketColor } from '../utils/marketStatus';

interface HeaderProps {
  price: TeslaPrice;
  lastUpdate?: Date;
}

export default function Header({ price, lastUpdate }: HeaderProps) {
  const isPositive = price.changePercent >= 0;
  const colorClass = isPositive ? 'text-tesla-green' : 'text-red-500';
  const marketLabel = getMarketLabel(price.marketStatus);
  const marketColor = getMarketColor(price.marketStatus);

  const formatLastUpdate = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    const timeString = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    
    if (seconds < 60) return `방금 전 (${timeString})`;
    if (minutes < 60) return `${minutes}분 전 (${timeString})`;
    return `${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
  };


  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-tesla-red">Giga-Pulse</h1>
            <span className="text-gray-400 text-sm">테슬라 주주 전용 인텔리전스 대시보드</span>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                마지막 업데이트: {formatLastUpdate(lastUpdate)}
              </span>
            )}
          </div>
          
          <div className="text-right flex items-center space-x-4">
            {/* 기존 가격 정보 */}
            <div className="text-right">
              <div className="text-2xl font-bold leading-tight">${price.current.toFixed(2)}</div>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <div className="text-sm text-gray-400">TSLA</div>
                <span className={`text-xs px-2 py-1 rounded ${marketColor} bg-gray-700/50`}>
                  {marketLabel}
                </span>
              </div>
              {/* 변동률 (%)과 변동 금액 ($) - TSLA 종가 아래, 나란히 배치 */}
              <div className={`flex items-center justify-end space-x-2 mt-1 ${colorClass}`}>
                <div className="text-sm">
                  {price.changePercent >= 0 ? '+' : ''}{price.changePercent.toFixed(2)}%
                </div>
                <div className="text-lg">
                  {price.change >= 0 ? '+' : ''}${price.change.toFixed(2)}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                고: ${price.high.toFixed(2)} | 저: ${price.low.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
