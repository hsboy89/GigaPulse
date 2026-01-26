import { NewsItem, TeslaPrice } from '../types';
import { calculateIntelligence } from '../utils/aiAnalyst';

interface IntelligenceHubProps {
    newsItems: NewsItem[];
    teslaPrice: TeslaPrice;
}

export default function IntelligenceHub({ newsItems, teslaPrice }: IntelligenceHubProps) {
    const intel = calculateIntelligence(newsItems, teslaPrice);

    const getTempColor = (temp: number) => {
        if (temp > 70) return 'text-tesla-green';
        if (temp > 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getTempBg = (temp: number) => {
        if (temp > 70) return 'bg-tesla-green/10 border-tesla-green/30';
        if (temp > 40) return 'bg-yellow-400/10 border-yellow-400/30';
        return 'bg-red-400/10 border-red-400/30';
    };

    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 w-full flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold text-blue-400 flex items-center">
                    🧠 GigaPulse AI Intelligence
                </h2>
                <div className="flex items-center space-x-1 bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-800/50">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                    </span>
                    <span className="text-[10px] text-blue-300 font-bold uppercase tracking-tighter">AI Processing</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {/* Investment Temperature Gauge */}
                <div className={`p-5 rounded-xl border transition-all duration-500 ${getTempBg(intel.investmentTemperature)}`}>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Investment Temp</div>
                            <div className={`text-3xl font-black ${getTempColor(intel.investmentTemperature)}`}>
                                {intel.investmentTemperature}°
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm font-bold px-3 py-1 rounded-full bg-gray-900/80 border border-white/10 ${getTempColor(intel.investmentTemperature)}`}>
                                {intel.investmentLabel}
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-900/50 h-3 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${intel.investmentTemperature > 70 ? 'bg-tesla-green' : intel.investmentTemperature > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${intel.investmentTemperature}%` }}
                        />
                    </div>

                    <div className="mt-4 p-3 bg-gray-900/40 rounded-lg border border-white/5">
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                            " {intel.aiSummary} "
                        </p>
                    </div>
                </div>

                {/* Technical Signals */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Technical RSI</div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-white">{intel.technicalSignals.rsi}</span>
                            <span className={`text-[10px] font-bold ${intel.technicalSignals.rsi > 70 ? 'text-red-400' : intel.technicalSignals.rsi < 30 ? 'text-tesla-green' : 'text-gray-400'}`}>
                                {intel.technicalSignals.rsi > 70 ? 'OVERBOUGHT' : intel.technicalSignals.rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">MA Status</div>
                        <div className="flex items-baseline space-x-2">
                            <span className={`text-xl font-bold ${intel.technicalSignals.maStatus === 'Bullish' ? 'text-tesla-green' : intel.technicalSignals.maStatus === 'Bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                                {intel.technicalSignals.maStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Key Drivers */}
                <div>
                    <h3 className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-3 px-1">Current Key Drivers</h3>
                    <div className="space-y-2">
                        {intel.keyDrivers.map((driver, idx) => (
                            <div key={idx} className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/50 flex items-center justify-between group hover:bg-gray-700/20 transition-colors">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${driver.sentiment === 'positive' ? 'bg-tesla-green' : driver.sentiment === 'negative' ? 'bg-red-400' : 'bg-gray-500'}`} />
                                    <span className="text-xs text-gray-300 truncate group-hover:text-white transition-colors">{driver.title}</span>
                                </div>
                                <span className={`text-[10px] font-mono font-bold ${driver.impact >= 0 ? 'text-tesla-green' : 'text-red-400'}`}>
                                    {driver.impact >= 0 ? '+' : ''}{driver.impact}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700 flex-shrink-0">
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span className="font-medium">AI CONFIDENCE: 88%</span>
                    <span className="font-mono">UPDATED: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
}
