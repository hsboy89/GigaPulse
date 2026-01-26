import { Portfolio, Scenario, TeslaPrice } from '../types';
import { calculatePortfolio } from '../utils/taxCalculator';
import { formatCurrency, formatPercent } from '../utils/taxCalculator';
import { getMarketLabel, getMarketColor } from '../utils/marketStatus';
import ScenarioSlider from './ScenarioSlider';

interface PortfolioSimulatorProps {
  portfolio: Portfolio;
  setPortfolio: (portfolio: Portfolio) => void;
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  teslaPrice: TeslaPrice;
}

export default function PortfolioSimulator({
  portfolio,
  setPortfolio,
  scenario,
  setScenario,
  teslaPrice,
}: PortfolioSimulatorProps) {
  const result = calculatePortfolio(portfolio, teslaPrice, scenario);
  const hasScenario = scenario.muskRisk !== 0 || scenario.trumpPolicy !== 0 || scenario.robotaxi !== 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <h2 className="text-xl font-bold text-tesla-green mb-4 flex-shrink-0">
        💰 Tesla Vision: Portfolio Simulator
      </h2>

      {/* 입력 필드 */}
      <div className="space-y-4 mb-6 flex-shrink-0">
        <div>
          <label className="block text-sm text-gray-400 mb-1">보유 주수</label>
          <input
            type="number"
            value={portfolio.shares}
            onChange={(e) => setPortfolio({ ...portfolio, shares: parseFloat(e.target.value) || 0 })}
            className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-tesla-red focus:outline-none"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">평균 단가 (USD)</label>
          <input
            type="number"
            value={portfolio.avgPrice}
            onChange={(e) => setPortfolio({ ...portfolio, avgPrice: parseFloat(e.target.value) || 0 })}
            className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-tesla-red focus:outline-none"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">환율 (KRW/USD)</label>
          <input
            type="number"
            value={portfolio.exchangeRate}
            onChange={(e) => setPortfolio({ ...portfolio, exchangeRate: parseFloat(e.target.value) || 0 })}
            className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-tesla-red focus:outline-none"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* 현재 포트폴리오 평가 */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-tesla-red">현재 평가</h3>
          <span className={`text-xs px-2 py-1 rounded ${getMarketColor(teslaPrice.marketStatus)} bg-gray-800/50`}>
            {getMarketLabel(teslaPrice.marketStatus)}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">현재 주가:</span>
            <span className="text-white font-semibold">${teslaPrice.current.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">평균 단가:</span>
            <span className="text-gray-300">${portfolio.avgPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-700 pt-2">
            <span className="text-gray-400">현재 평가액:</span>
            <span className="text-white font-semibold">{formatCurrency(result.currentValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">초기 투자금:</span>
            <span className="text-gray-300">{formatCurrency(portfolio.shares * portfolio.avgPrice)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-700 pt-2">
            <span className="text-gray-400">손익금:</span>
            <span className={result.profit >= 0 ? 'text-tesla-green font-semibold' : 'text-red-400 font-semibold'}>
              {formatCurrency(result.profit)} ({formatPercent(result.profitPercent)})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">손익금 (원화):</span>
            <span className={result.profitKRW >= 0 ? 'text-tesla-green font-bold' : 'text-red-400 font-bold'}>
              {formatCurrency(result.profitKRW, 'KRW')}
            </span>
          </div>
        </div>
      </div>

      {/* 스크롤 가능한 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* 시나리오 시뮬레이터 */}
        <div className="flex flex-col">
          <ScenarioSlider scenario={scenario} setScenario={setScenario} />
        </div>

        {/* 시나리오 결과 */}
        {hasScenario && (
          <div className="bg-gray-900 rounded-lg p-4 mt-4 border border-tesla-green">
            <h3 className="text-lg font-semibold mb-3 text-tesla-green">시나리오 평가</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">예상 평가액:</span>
                <span className="text-tesla-green font-semibold">
                  {formatCurrency(result.scenarioValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">예상 손익금:</span>
                <span className={result.scenarioProfit >= 0 ? 'text-tesla-green' : 'text-red-400'}>
                  {formatCurrency(result.scenarioProfit)} ({formatPercent(result.scenarioProfitPercent)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">예상 손익금 (원화):</span>
                <span className={result.scenarioProfit >= 0 ? 'text-tesla-green' : 'text-red-400'}>
                  {formatCurrency(result.scenarioProfit * portfolio.exchangeRate, 'KRW')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 목표가 알림 */}
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <div className="text-xs text-yellow-400">
            <strong>알림:</strong> 전고점 $490 돌파 시 알림 | 지지선 $450 이탈 시 손절 고려
          </div>
        </div>
      </div>
    </div>
  );
}

