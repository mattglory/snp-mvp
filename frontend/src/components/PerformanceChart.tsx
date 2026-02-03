import { useState } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { APYChart } from './charts/APYChart';
import { useVaultHistory } from '../hooks/useVaultHistory';

interface PerformanceChartProps {
  vaultId: string;
  vaultName?: string;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
];

export function PerformanceChart({ vaultId, vaultName }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data: historyData } = useVaultHistory(vaultId, timeRange);

  // Calculate stats
  const stats = historyData && historyData.length > 0
    ? {
        currentAPY: historyData[historyData.length - 1]?.apy || 0,
        averageAPY: historyData.reduce((sum, p) => sum + p.apy, 0) / historyData.length,
        maxAPY: Math.max(...historyData.map(p => p.apy)),
        minAPY: Math.min(...historyData.map(p => p.apy)),
        change: historyData.length > 1
          ? historyData[historyData.length - 1].apy - historyData[0].apy
          : 0,
      }
    : { currentAPY: 0, averageAPY: 0, maxAPY: 0, minAPY: 0, change: 0 };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">APY Performance</h3>
              {vaultName && (
                <p className="text-sm text-gray-400">{vaultName} Vault</p>
              )}
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 p-1 bg-gray-800/50 rounded-lg">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range.value
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900/50">
        <div>
          <div className="text-xs text-gray-400 mb-1">Current APY</div>
          <div className="text-lg font-bold text-orange-400">
            {stats.currentAPY.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Average</div>
          <div className="text-lg font-bold text-white">
            {stats.averageAPY.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">High</div>
          <div className="text-lg font-bold text-green-400">
            {stats.maxAPY.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Low</div>
          <div className="text-lg font-bold text-red-400">
            {stats.minAPY.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <APYChart vaultId={vaultId} timeRange={timeRange} />
      </div>

      {/* Period Change */}
      <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {timeRange === '7d' ? '7 Day' : timeRange === '30d' ? '30 Day' : timeRange === '90d' ? '90 Day' : '1 Year'} Change
          </span>
          <div className={`flex items-center space-x-1 ${stats.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span className="text-sm font-semibold">
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}%
            </span>
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceChart;
