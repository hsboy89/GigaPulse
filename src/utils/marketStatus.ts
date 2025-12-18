export type MarketStatus = 'premarket' | 'daymarket' | 'aftermarket' | 'closed';

export interface MarketInfo {
  status: MarketStatus;
  label: string;
  currentPrice: number;
  closePrice: number;
}

/**
 * 현재 마켓 상태를 계산합니다 (미국 동부시간 기준)
 * - 프리마켓: 04:00 - 09:30 ET (한국시간 18:00 - 23:30)
 * - 데이마켓: 09:30 - 16:00 ET (한국시간 23:30 - 06:00 다음날)
 * - 애프터마켓: 16:00 - 20:00 ET (한국시간 06:00 - 10:00 다음날)
 * - 종가: 그 외 시간
 */
export function getMarketStatus(now: Date = new Date()): MarketStatus {
  // 한국시간을 미국 동부시간으로 변환 (한국시간 = ET + 13시간)
  const kstHour = now.getHours();
  const kstMinute = now.getMinutes();
  
  // 한국시간을 ET로 변환 (ET = KST - 13)
  let etHour = kstHour - 13;
  if (etHour < 0) etHour += 24;
  
  const timeInMinutes = etHour * 60 + kstMinute;
  
  // 프리마켓: 04:00 - 09:30 ET (240분 - 570분)
  if (timeInMinutes >= 240 && timeInMinutes < 570) {
    return 'premarket';
  }
  
  // 데이마켓: 09:30 - 16:00 ET (570분 - 960분)
  if (timeInMinutes >= 570 && timeInMinutes < 960) {
    return 'daymarket';
  }
  
  // 애프터마켓: 16:00 - 20:00 ET (960분 - 1200분)
  if (timeInMinutes >= 960 && timeInMinutes < 1200) {
    return 'aftermarket';
  }
  
  // 종가
  return 'closed';
}

export function getMarketLabel(status: MarketStatus): string {
  switch (status) {
    case 'premarket':
      return '프리마켓';
    case 'daymarket':
      return '데이마켓';
    case 'aftermarket':
      return '애프터마켓';
    case 'closed':
      return '종가';
    default:
      return '종가';
  }
}

export function getMarketColor(status: MarketStatus): string {
  switch (status) {
    case 'premarket':
      return 'text-blue-400';
    case 'daymarket':
      return 'text-green-400';
    case 'aftermarket':
      return 'text-purple-400';
    case 'closed':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

