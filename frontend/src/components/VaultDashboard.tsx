import { formatSTX, formatAPY } from '../utils/formatting';
import CONFIG from '../config';

interface VaultDashboardProps {
  selectedVault: string;
  isWalletConnected: boolean;
}

interface VaultData {
  tvl: number;
  userBalance: number;
  sharePrice: number;
  apy: number;
}

export default function VaultDashboard({ selectedVault, isWalletConnected }: VaultDashboardProps) {
  // Mock data for each vault (in production, fetch from contracts)
  const vaultData: Record<string, VaultData> = {
    conservative: {
      tvl: 500000000,  // 500 STX
      userBalance: 0,
      sharePrice: 1.0,
      apy: 9.2,
    },
    balanced: {
      tvl: 1000000000, // 1000 STX
      userBalance: 0,
      sharePrice: 0.999998,
      apy: 14.1,
    },
    growth: {
      tvl: 300000000,  // 300 STX
      userBalance: 0,
      sharePrice: 1.0,
      apy: 21.5,
    },
  };

  const currentVault = CONFIG.vaultMetadata[selectedVault as keyof typeof CONFIG.vaultMetadata];
  const currentData = vaultData[selectedVault];

  return (
    <div className="mb-12">
      {/* Selected Vault Header */}
      <div className={`
        relative overflow-hidden rounded-xl border-2 border-bitcoin-orange p-6 mb-6
        shadow-lg shadow-bitcoin-orange/20
      `}>
        <div className={`
          absolute inset-0 bg-gradient-to-br ${currentVault.gradient} opacity-20
        `} />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentVault.icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{currentVault.name}</h3>
                <p className="text-sm text-gray-400">{currentVault.symbol}</p>
              </div>
            </div>
            <div className="badge badge-success">Active</div>
          </div>
          
          <p className="text-gray-300 mb-4">{currentVault.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <div className={`badge ${
              currentVault.riskLevel === 'low' ? 'badge-success' :
              currentVault.riskLevel === 'medium' ? 'badge-warning' :
              'badge-error'
            }`}>
              Risk: {currentVault.riskLevel.toUpperCase()}
            </div>
            <div className="badge badge-bitcoin">
              {currentVault.targetAPY} APY
            </div>
            <div className="badge">
              {currentVault.performanceFee}% Performance Fee
            </div>
          </div>
        </div>
      </div>

      {/* Vault Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Value Locked</div>
          <div className="stat-value">{formatSTX(currentData.tvl, 0)} STX</div>
          <div className="text-sm text-gray-400 mt-2">
            💎 In this vault
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Current APY</div>
          <div className="apy-display">{formatAPY(currentData.apy)}</div>
          <div className="text-sm text-success mt-2">
            ↗ Auto-optimized
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Share Price</div>
          <div className="stat-value font-mono text-2xl">
            {currentData.sharePrice.toFixed(6)}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            STX per share
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Your Balance</div>
          <div className="stat-value">
            {isWalletConnected ? formatSTX(currentData.userBalance, 0) : '—'}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {isWalletConnected ? 'STX deposited' : 'Connect wallet'}
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Card */}
      {isWalletConnected && (
        <div className="card">
          <h4 className="font-bold mb-4">Manage Your Position</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Section */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Deposit STX
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (min 1000 STX)"
                  className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
                  min="1000"
                />
                <button className="btn-primary px-6">
                  Deposit
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Minimum first deposit: 1000 STX
              </p>
            </div>

            {/* Withdraw Section */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Withdraw STX
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
                  disabled={currentData.userBalance === 0}
                />
                <button 
                  className="btn-primary px-6"
                  disabled={currentData.userBalance === 0}
                >
                  Withdraw
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {currentVault.performanceFee}% performance fee on withdrawals
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Vaults Overview */}
      <div className="mt-6 card">
        <h4 className="font-bold mb-4">Your Portfolio Across All Vaults</h4>
        
        <div className="space-y-3">
          {Object.entries(CONFIG.vaultMetadata).map(([key, vault]) => {
            const data = vaultData[key];
            return (
              <div
                key={key}
                className={`
                  flex items-center justify-between p-4 rounded-lg border
                  ${key === selectedVault 
                    ? 'bg-dark-card/50 border-bitcoin-orange' 
                    : 'bg-dark-card/30 border-dark-border'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{vault.icon}</div>
                  <div>
                    <div className="font-semibold">{vault.name}</div>
                    <div className="text-xs text-gray-500">{vault.symbol}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Your Balance</div>
                    <div className="font-semibold">
                      {isWalletConnected ? formatSTX(data.userBalance, 0) : '—'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">APY</div>
                    <div className={`
                      font-semibold
                      ${vault.riskLevel === 'high' ? 'text-purple-400' :
                        vault.riskLevel === 'medium' ? 'text-bitcoin-orange' :
                        'text-success'}
                    `}>
                      {formatAPY(data.apy)}
                    </div>
                  </div>

                  {key !== selectedVault && (
                    <button
                      className="text-xs text-bitcoin-orange hover:text-bitcoin-orange/80"
                      onClick={() => {/* scroll to vault selector */}}
                    >
                      Switch →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-dark-border">
          <div className="flex justify-between items-center">
            <div className="text-gray-400">Total Portfolio Value</div>
            <div className="text-2xl font-bold">
              {isWalletConnected 
                ? formatSTX(Object.values(vaultData).reduce((sum, v) => sum + v.userBalance, 0), 0)
                : '—'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
