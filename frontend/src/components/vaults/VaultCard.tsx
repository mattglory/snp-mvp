import { motion } from 'framer-motion';
import { Shield, TrendingUp, Rocket, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatAPY, formatPercentChange } from '../../utils/formatters';
import { useVaultData } from '../../hooks/useVaultData';

const vaultIcons = {
  conservative: Shield,
  balanced: TrendingUp,
  growth: Rocket,
};

const vaultColors = {
  conservative: {
    bg: 'from-green-500/5 to-emerald-500/5',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  balanced: {
    bg: 'from-orange-500/5 to-amber-500/5',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/20',
  },
  growth: {
    bg: 'from-purple-500/5 to-pink-500/5',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
};

interface VaultCardProps {
  vaultId: 'conservative' | 'balanced' | 'growth';
  name: string;
  description: string;
  riskLevel: string;
  targetAPY: string;
  isSelected: boolean;
  userAddress?: string;
  onSelect: () => void;
}

export function VaultCard({
  vaultId,
  name,
  description,
  riskLevel,
  targetAPY,
  isSelected,
  userAddress,
  onSelect,
}: VaultCardProps) {
  const { data: vaultData, isLoading } = useVaultData(vaultId, userAddress);
  const Icon = vaultIcons[vaultId];
  const colors = vaultColors[vaultId];
  
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-gray-800 rounded-xl" />
          <div className="w-20 h-6 bg-gray-800 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-gray-800 rounded" />
          <div className="w-full h-20 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full text-left bg-gradient-to-br ${colors.bg} 
        border-2 ${colors.border} rounded-2xl p-6 
        transition-all duration-300 group
        ${isSelected ? `ring-4 ring-orange-500/50 ${colors.glow} shadow-2xl` : 'hover:shadow-xl'}
      `}
    >
      {/* Selected Badge */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
        >
          ACTIVE
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-sm text-gray-400">sn{vaultId.toUpperCase()}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg ${colors.text} bg-gray-800/50 text-xs font-medium`}>
          {riskLevel} RISK
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-6">{description}</p>

      {/* Main Metrics */}
      <div className="space-y-4 mb-6">
        {/* APY */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current APY</span>
            <div className="flex items-center space-x-1">
              {vaultData && vaultData.apyChange24h >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-green-400" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-xs font-medium ${vaultData && vaultData.apyChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {vaultData ? formatPercentChange(vaultData.apyChange24h) : '+0.00%'}
              </span>
            </div>
          </div>
          <div className={`text-3xl font-bold ${colors.text}`}>
            {vaultData ? formatAPY(vaultData.apy) : '0.00%'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Target: {targetAPY}</div>
        </div>

        {/* TVL & Your Balance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 mb-1">Total Value Locked</div>
            <div className="text-lg font-bold text-white">
              {vaultData ? formatCurrency(vaultData.tvl, 1) : '$0'}
            </div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 mb-1">Your Balance</div>
            <div className="text-lg font-bold text-white">
              {vaultData ? formatCurrency(vaultData.userBalance, 2) : '$0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Action Hint */}
      <div className={`
        flex items-center justify-center space-x-2 py-3 rounded-lg
        ${isSelected ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-gray-800/30 border border-gray-700/50'}
        transition-all duration-300
        group-hover:border-gray-600
      `}>
        <span className="text-sm font-medium text-gray-300">
          {isSelected ? 'Manage Position' : 'Select Vault'}
        </span>
        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </div>
    </motion.button>
  );
}
