import { Shield, TrendingUp, Rocket, Check, ArrowUpRight, ArrowDownRight, Info, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface VaultCardsProps {
  selectedVault: string;
  onVaultSelect: (vaultId: string) => void;
  userAddress?: string;
}

interface VaultData {
  tvl: number;
  apy: number;
  userBalance: number;
  change24h: number;
}

const CONTRACT_ADDRESS = 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA';

const vaultConfig = [
  {
    id: 'conservative',
    name: 'Conservative Vault',
    token: 'snSTX-CONS',
    contract: 'vault-conservative',
    assetName: 'vault-shares-conservative',
    description: 'Capital preservation focused with stable, lower-risk DeFi strategies',
    targetAPY: '8-10%',
    baseAPY: 8.5,
    risk: 'LOW',
    riskScore: 2,
    riskColor: 'text-emerald-400',
    riskBg: 'bg-emerald-500/10',
    icon: Shield,
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20',
    iconColor: 'text-emerald-400',
    cardGradient: 'from-emerald-950/30 via-gray-900 to-gray-900',
    borderColor: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    glowColor: 'shadow-emerald-500/20',
    baseTVL: 1_800_000,
  },
  {
    id: 'balanced',
    name: 'Balanced Vault',
    token: 'snSTX',
    contract: 'vault-stx-v2',
    assetName: 'vault-shares',
    description: 'Diversified approach balancing yield potential with risk management',
    targetAPY: '12-16%',
    baseAPY: 14.2,
    risk: 'MEDIUM',
    riskScore: 3,
    riskColor: 'text-orange-400',
    riskBg: 'bg-orange-500/10',
    icon: TrendingUp,
    iconBg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-400',
    cardGradient: 'from-orange-950/30 via-gray-900 to-gray-900',
    borderColor: 'border-orange-500/20',
    hoverBorder: 'hover:border-orange-500/40',
    glowColor: 'shadow-orange-500/20',
    baseTVL: 3_200_000,
  },
  {
    id: 'growth',
    name: 'Growth Vault',
    token: 'snSTX-GRTH',
    contract: 'vault-growth',
    assetName: 'vault-shares-growth',
    description: 'Higher yield potential through active strategy allocation and leverage',
    targetAPY: '18-25%',
    baseAPY: 21.8,
    risk: 'HIGH',
    riskScore: 4,
    riskColor: 'text-purple-400',
    riskBg: 'bg-purple-500/10',
    icon: Rocket,
    iconBg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
    cardGradient: 'from-purple-950/30 via-gray-900 to-gray-900',
    borderColor: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/40',
    glowColor: 'shadow-purple-500/20',
    baseTVL: 2_100_000,
  }
];

// Format number to K/M/B
function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

export function VaultCards({ selectedVault, onVaultSelect, userAddress }: VaultCardsProps) {
  const [hoveredVault, setHoveredVault] = useState<string | null>(null);
  const [userPositions, setUserPositions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Fetch user positions from blockchain
  const fetchUserPositions = useCallback(async () => {
    if (!userAddress) {
      setUserPositions({});
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${userAddress}/balances`
      );
      const data = await response.json();

      const positions: Record<string, number> = {};

      for (const vault of vaultConfig) {
        const assetId = `${CONTRACT_ADDRESS}.${vault.contract}::${vault.assetName}`;

        if (data.fungible_tokens && data.fungible_tokens[assetId]) {
          const shares = parseInt(data.fungible_tokens[assetId].balance) || 0;
          // Convert micro units to STX (assuming 1:1 share price)
          positions[vault.id] = shares / 1_000_000;
        } else {
          positions[vault.id] = 0;
        }
      }

      setUserPositions(positions);
    } catch (err) {
      console.error('Failed to fetch user positions:', err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Fetch on mount and periodically
  useEffect(() => {
    fetchUserPositions();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUserPositions, 30000);
    return () => clearInterval(interval);
  }, [fetchUserPositions]);

  // Get vault data with real user positions
  const getVaultData = (vaultId: string): VaultData => {
    const vault = vaultConfig.find(v => v.id === vaultId);
    if (!vault) {
      return { tvl: 0, apy: 0, userBalance: 0, change24h: 0 };
    }

    return {
      tvl: vault.baseTVL,
      apy: vault.baseAPY,
      userBalance: userPositions[vaultId] || 0,
      change24h: (Math.random() - 0.5) * 2, // Still mock for now
    };
  };

  // Calculate total user deposits
  const totalUserDeposits = Object.values(userPositions).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Select Vault
          </h2>
          <p className="text-gray-400">
            Choose a strategy based on your risk tolerance and return objectives
          </p>
        </div>

        {/* Protocol Stats */}
        <div className="hidden lg:flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Protocol TVL</div>
            <div className="text-xl font-bold text-white">$7.1M</div>
          </div>
          <div className="w-px h-10 bg-gray-700"></div>
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Your Total</div>
            <div className="text-xl font-bold text-orange-400">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : (
                `${totalUserDeposits.toFixed(2)} STX`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {vaultConfig.map((vault) => {
          const Icon = vault.icon;
          const isSelected = selectedVault === vault.id;
          const isHovered = hoveredVault === vault.id;
          const data = getVaultData(vault.id);
          const hasPosition = data.userBalance > 0;

          return (
            <button
              key={vault.id}
              onClick={() => onVaultSelect(vault.id)}
              onMouseEnter={() => setHoveredVault(vault.id)}
              onMouseLeave={() => setHoveredVault(null)}
              className={`
                group relative text-left
                bg-gradient-to-br ${vault.cardGradient}
                border-2 ${vault.borderColor} ${vault.hoverBorder}
                rounded-2xl p-6
                transition-all duration-300
                ${isSelected ? `ring-2 ring-orange-500/50 ${vault.glowColor} shadow-2xl scale-[1.02]` : 'hover:scale-[1.02]'}
                ${isHovered ? 'shadow-xl' : ''}
                ${hasPosition ? 'ring-1 ring-green-500/30' : ''}
              `}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-xs text-white font-bold shadow-lg animate-pulse">
                  <Check className="w-4 h-4" />
                  <span>SELECTED</span>
                </div>
              )}

              {/* Has Position Badge */}
              {hasPosition && !isSelected && (
                <div className="absolute -top-3 -right-3 flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs text-white font-bold shadow-lg">
                  <Check className="w-4 h-4" />
                  <span>ACTIVE</span>
                </div>
              )}

              {/* Icon & Title */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`${vault.iconBg} backdrop-blur-sm p-3 rounded-xl border border-white/10`}>
                    <Icon className={`w-7 h-7 ${vault.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
                      {vault.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{vault.token}</p>
                  </div>
                </div>

                {/* Risk Badge */}
                <div className={`px-3 py-1 rounded-lg ${vault.riskBg} border border-white/5`}>
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs font-bold ${vault.riskColor}`}>{vault.risk}</span>
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-3 rounded-full ${
                            i < vault.riskScore ? vault.riskColor.replace('text-', 'bg-') : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                {vault.description}
              </p>

              {/* Current APY - HERO METRIC */}
              <div className={`relative mb-6 p-5 rounded-xl ${vault.riskBg} border ${vault.borderColor} backdrop-blur-sm overflow-hidden`}>
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${vault.iconColor.replace('text-', 'from-')} to-transparent opacity-5`}></div>

                <div className="relative z-10">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Current APY
                    </span>
                    <div className="flex items-center space-x-1">
                      {data.change24h >= 0 ? (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">
                            +{data.change24h.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                          <span className="text-xs font-bold text-red-400">
                            {data.change24h.toFixed(1)}%
                          </span>
                        </>
                      )}
                      <span className="text-[10px] text-gray-500">24h</span>
                    </div>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className={`text-4xl font-bold ${vault.iconColor}`}>
                      {data.apy.toFixed(2)}%
                    </span>
                    <span className="text-sm text-gray-500">
                      Target: {vault.targetAPY}
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] text-gray-500 flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>Includes compounding effects</span>
                  </div>
                </div>
              </div>

              {/* TVL & User Balance */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                    Vault TVL
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${formatNumber(data.tvl)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    12 strategies
                  </div>
                </div>

                <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border ${hasPosition ? 'border-green-500/30' : 'border-gray-800'}`}>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                    Your Position
                  </div>
                  <div className={`text-xl font-bold ${hasPosition ? 'text-green-400' : 'text-white'}`}>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `${data.userBalance.toFixed(2)} STX`
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${hasPosition ? 'text-green-400' : 'text-gray-500'}`}>
                    {hasPosition ? `Earning ${data.apy.toFixed(1)}% APY` : 'No position'}
                  </div>
                </div>
              </div>

              {/* Performance Fee */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-900/30 rounded-lg border border-gray-800 mb-4">
                <span className="text-xs text-gray-400">Performance Fee</span>
                <span className="text-sm font-bold text-gray-300">8%</span>
              </div>

              {/* Action Button */}
              <div
                className={`
                  flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold
                  transition-all duration-300
                  ${isSelected
                    ? `bg-orange-500 text-white`
                    : hasPosition
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 group-hover:bg-green-500/30'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 group-hover:bg-gray-800 group-hover:border-gray-600'
                  }
                `}
              >
                <span className="text-sm">
                  {isSelected ? 'Deposit / Withdraw' : hasPosition ? 'Manage Position' : 'Select This Vault'}
                </span>
                <ArrowUpRight className={`w-4 h-4 transition-transform ${isHovered || isSelected ? 'translate-x-1 -translate-y-1' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-4">
        <Info className="w-4 h-4" />
        <span>All vaults are non-custodial smart contracts. Past performance does not guarantee future results. DeFi involves risk of loss.</span>
      </div>
    </div>
  );
}
