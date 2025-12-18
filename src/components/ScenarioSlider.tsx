import { Scenario } from '../types';

interface ScenarioSliderProps {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
}

export default function ScenarioSlider({ scenario, setScenario }: ScenarioSliderProps) {
  const updateScenario = (key: keyof Scenario, value: number) => {
    setScenario({ ...scenario, [key]: value });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-tesla-red flex-shrink-0">시나리오 시뮬레이터</h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto">
        {/* 머스크 리스크 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">
              머스크 리스크 (X 지분 인수 매도)
            </label>
            <span className={`text-sm font-semibold ${
              scenario.muskRisk < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {scenario.muskRisk.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="0"
            step="0.5"
            value={scenario.muskRisk}
            onChange={(e) => updateScenario('muskRisk', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-10%</span>
            <span>0%</span>
          </div>
        </div>

        {/* 트럼프 정책 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">
              트럼프 정책 영향
            </label>
            <span className={`text-sm font-semibold ${
              scenario.trumpPolicy > 0 ? 'text-tesla-green' : 
              scenario.trumpPolicy < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {scenario.trumpPolicy >= 0 ? '+' : ''}{scenario.trumpPolicy.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="-15"
            max="25"
            step="1"
            value={scenario.trumpPolicy}
            onChange={(e) => updateScenario('trumpPolicy', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>보조금 폐지 (-15%)</span>
            <span>규제 완화 (+25%)</span>
          </div>
        </div>

        {/* 로보택시 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">
              로보택시 밸류에이션
            </label>
            <span className={`text-sm font-semibold ${
              scenario.robotaxi > 0 ? 'text-tesla-green' : 'text-gray-400'
            }`}>
              +{scenario.robotaxi.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={scenario.robotaxi}
            onChange={(e) => updateScenario('robotaxi', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tesla-green"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>+200% ($1,000+ 목표)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

