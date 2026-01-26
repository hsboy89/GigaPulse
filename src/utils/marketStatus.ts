export type MarketStatus = 'premarket' | 'daymarket' | 'aftermarket' | 'closed';

export interface MarketInfo {
  status: MarketStatus;
  label: string;
  currentPrice: number;
  closePrice: number;
}

/**
 * 현재 마켓 상태를 계산합니다 (미국 동부시간 기준, DST 자동 반영)
 * - 프리마켓: 04:00 - 09:30 ET
 * - 데이마켓: 09:30 - 16:00 ET
 * - 애프터마켓: 16:00 - 20:00 ET
 * - 종가: 그 외 시간
 *
 * 이전 구현은 "KST = ET + 13시간"을 고정으로 가정했기 때문에
 * 겨울철(표준시, ET와 KST 시차가 14시간일 때) 프리마켓/데이마켓 판단이
 * 잘못되는 문제가 있었다. 이를 방지하기 위해 America/New_York 타임존을
 * 직접 사용하여 DST를 포함한 정확한 ET 시간을 계산한다.
 */
export function getMarketStatus(now: Date = new Date()): MarketStatus {
  // now(로컬 시간)를 미국 동부시간(ET)으로 변환
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const etDate = new Date(etString);

  const etHour = etDate.getHours();
  const etMinute = etDate.getMinutes();

  const timeInMinutes = etHour * 60 + etMinute;
  
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

