import { Wallet, TrendingUp, Layers, DollarSign } from 'lucide-react';
import { formatNumber, formatPercentage, formatCurrency } from '../../utils/formatting';

export function StatsOverview({ vaultData, strategies }) {
  const weightedAPY = strategies?.reduce((sum, s) => sum + (s.apy * s.allocation / 100), 0) || 0;
  const totalTVL = strategies?.reduce((sum, s) => sum + s.tvl, 0) || 0;
  const userBalance = vaultData?.balance || 0;
  const userEarnings = vaultData?.earnings || 0;
  const earningsChange = vaultData?.earningsChange || 0;

  const stats = [
    {
      label: 'Your Balance',
      value: formatCurrency(userBalance, 'STX'),
      change: userEarnings > 0 ? `+${formatCurrency(userEarnings, 'STX')} earned` : 'Deposit to start earning',
      changeColor: userEarnings > 0 ? 'text-green-400' : 'text-gray-400',
      icon: Wallet,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      gradient: 'from-blue-500/10 to-blue-600/5'
    },
    {
      label: 'Current APY',
      value: formatPercentage(weightedAPY),
      change: 'Weighted across strategies',
      changeColor: 'text-orange-400',
      icon: TrendingUp,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10',
      gradient: 'from-orange-500/10 to-orange-600/5'
    },
    {
      label: 'Total TVL',
      value: formatCurrency(totalTVL / 1000, 'STX', 1) + 'K',
      change: 'Across all vaults',
      changeColor: 'text-purple-400',
      icon: DollarSign,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      gradient: 'from-purple-500/10 to-purple-600/5'
    },
    {
      label: 'Active Strategies',
      value: strategies?.length || '12',
      change: 'Auto-rebalanced',
      changeColor: 'text-green-400',
      icon: Layers,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10',
      gradient: 'from-green-500/10 to-green-600/5'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`relative group bg-gradient-to-br ${stat.gradient} border border-gray-800 hover:border-gray-700 rounded-xl p-6 transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className={`text-xs ${stat.changeColor}`}>
                  {stat.change}
                </div>
              </div>
              <div className={`${stat.iconBg} p-3 rounded-lg`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>

            {/* Subtle animation indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        );
      })}
    </div>
  );
}
