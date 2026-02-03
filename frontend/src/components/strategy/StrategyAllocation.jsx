import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';

const COLORS = [
  '#F97316', // orange
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EAB308', // yellow
  '#14B8A6', // teal
  '#F43F5E', // rose
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#A855F7', // violet
  '#F59E0B', // amber
];

export function StrategyAllocation({ strategies, selectedVault }) {
  const filteredStrategies = strategies.filter(s => s.allocation > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-sm text-gray-300">Allocation: {data.allocation}%</p>
          <p className="text-sm text-gray-300">APY: {data.apy}%</p>
          <p className="text-sm text-gray-300">TVL: {(data.tvl / 1000).toFixed(1)}K STX</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Layers className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Strategy Allocation</h3>
          <p className="text-sm text-gray-400">Automated diversification across 12 protocols</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredStrategies}
                dataKey="allocation"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                label={({ name, allocation }) => `${allocation}%`}
                labelLine={false}
              >
                {filteredStrategies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Strategy List */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-400 pb-2 border-b border-gray-700">
            <div>Protocol</div>
            <div className="text-right">Allocation / APY</div>
          </div>
          
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredStrategies.map((strategy, index) => (
              <div
                key={strategy.name}
                className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {strategy.name}
                    </div>
                    <div className="text-xs text-gray-500">{strategy.type}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-sm font-semibold text-white">
                    {strategy.allocation}%
                  </div>
                  <div className="text-xs text-orange-400">
                    {strategy.apy}% APY
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Total Protocols</div>
          <div className="text-2xl font-bold text-white">{filteredStrategies.length}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Weighted APY</div>
          <div className="text-2xl font-bold text-orange-400">
            {(filteredStrategies.reduce((sum, s) => sum + (s.apy * s.allocation / 100), 0)).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Total TVL</div>
          <div className="text-2xl font-bold text-white">
            {((filteredStrategies.reduce((sum, s) => sum + s.tvl, 0)) / 1000).toFixed(0)}K
          </div>
        </div>
      </div>
    </div>
  );
}
