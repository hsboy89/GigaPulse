import { useState } from 'react';
import Header from './Header';
import MuskFeed from './MuskFeed';
import PolicyMonitor from './PolicyMonitor';
import PortfolioSimulator from './PortfolioSimulator';
import MacroIndicators from './MacroIndicators';
import FearGreedIndexComponent from './FearGreedIndex';
import { Portfolio, Scenario } from '../types';
import { useNewsUpdate } from '../hooks/useNewsUpdate';

export default function Dashboard() {
  const { newsItems, muskPosts, teslaPrice, lastUpdate } = useNewsUpdate();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    shares: 10,
    avgPrice: 400,
    exchangeRate: 1300,
  });
  const [scenario, setScenario] = useState<Scenario>({
    muskRisk: 0,
    trumpPolicy: 0,
    robotaxi: 0,
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header price={teslaPrice} lastUpdate={lastUpdate} />
      
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Panel: Elon Musk Feed */}
          <div className="lg:col-span-1">
            <MuskFeed muskPosts={muskPosts} />
          </div>
          
          {/* Center Panel: Policy & News */}
          <div className="lg:col-span-1">
            <PolicyMonitor newsItems={newsItems} />
          </div>
          
          {/* Right Panel: Portfolio Simulator */}
          <div className="lg:col-span-1">
            <PortfolioSimulator
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              scenario={scenario}
              setScenario={setScenario}
              teslaPrice={teslaPrice}
            />
          </div>
        </div>
        
        {/* Bottom Section: Additional Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <MacroIndicators />
          <FearGreedIndexComponent />
        </div>
      </div>
    </div>
  );
}

