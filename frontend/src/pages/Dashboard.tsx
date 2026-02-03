import { useState } from 'react';
import { VaultCard } from '../components/vaults/VaultCard';
import { APYChart } from '../components/charts/APYChart';
import { DepositWithdraw } from '../components/DepositWithdraw';
import { formatCurrency } from '../utils/formatters';
import { useVaultData } from '../hooks/useVaultData';

const vaults = [
  {
    id: 'conservative',
    name: 'Conservative Vault',
    description: 'Low-risk strategies for capital preservation',
    riskLevel: 'LOW',
    targetAPY: '8-10%',
  },
  {
    id: 'balanced',
    name: 'Balanced Vault',
    description: 'Optimized balance of risk and reward',
    riskLevel: 'MEDIUM',
    targetAPY: '12-16%',
  },
  {
    id: 'growth',
    name: 'Growth Vault',
    description: 'High-yield strategies for maximum returns',
    riskLevel: 'HIGH',
    targetAPY: '18-25%',
  },
] as const;

interface DashboardProps {
  userAddress?: string;
  isConnected: boolean;
  userSession?: any;
}

export function Dashboard({ userAddress, isConnected, userSession }: DashboardProps) {
  const [selectedVault, setSelectedVault] = useState<'conservative' | 'balanced' | 'growth'>('balanced');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Load data for all vaults to show total stats
  const { data: conservativeData } = useVaultData('conservative', userAddress);
  const { data: balancedData } = useVaultData('balanced', userAddress);
  const { data: growthData } = useVaultData('growth', userAddress);

  const totalTVL = (conservativeData?.tvl || 0) + (balancedData?.tvl || 0) + (growthData?.tvl || 0);
  const averageAPY = conservativeData && balancedData && growthData
    ? (conservativeData.apy + balancedData.apy + growthData.apy) / 3
    : 0;

  const vaultContractMap: Record<string, string> = {
    'conservative': 'vault-conservative',
    'balanced': 'vault-stx-v2',
    'growth': 'vault-growth',
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Bitcoin's Intelligent <span className="text-orange-500">Yield Aggregator</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Automated DeFi strategies across 12+ protocols. Maximize your yield on Bitcoin Layer 2.
        </p>
      </div>

      {/* Protocol Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-400 mb-2">Total Value Locked</div>
          <div className="text-3xl font-bold text-white mb-1">{formatCurrency(totalTVL, 1)}</div>
          <div className="text-xs text-gray-500">Across 3 vaults • 12 strategies</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-400 mb-2">Average APY</div>
          <div className="text-3xl font-bold text-orange-500 mb-1">{averageAPY.toFixed(2)}%</div>
          <div className="text-xs text-green-400">↗ Auto-compounding</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-400 mb-2">Active Strategies</div>
          <div className="text-3xl font-bold text-white mb-1">12</div>
          <div className="text-xs text-gray-500">Automated rebalancing</div>
        </div>
      </div>

      {/* Vault Selection */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Choose Your Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vaultId={vault.id}
              name={vault.name}
              description={vault.description}
              riskLevel={vault.riskLevel}
              targetAPY={vault.targetAPY}
              isSelected={selectedVault === vault.id}
              userAddress={userAddress}
              onSelect={() => setSelectedVault(vault.id)}
            />
          ))}
        </div>
      </div>

      {/* Chart and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Performance</h2>
            <div className="flex space-x-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${timeRange === range 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
                  `}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <APYChart vaultId={selectedVault} timeRange={timeRange} />
        </div>

        {/* Deposit/Withdraw Panel - Takes 1 column */}
        <div className="lg:col-span-1">
          <DepositWithdraw
            vaultContract={vaultContractMap[selectedVault]}
            vaultName={vaults.find(v => v.id === selectedVault)?.name || 'Balanced Vault'}
            userSession={userSession}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  );
}
