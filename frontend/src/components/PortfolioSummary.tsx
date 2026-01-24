import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Wallet, DollarSign, RefreshCw, PieChart } from 'lucide-react';
import { UserSession } from '@stacks/connect';

interface PortfolioSummaryProps {
  userAddress: string;
  userSession?: UserSession; // Optional - not currently used but kept for future use
}

interface VaultPosition {
  vaultId: string;
  name: string;
  shares: number;
  estimatedValue: number;
  apy: number;
}

const CONTRACT_ADDRESS = 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA';

const vaultConfigs = [
  { id: 'balanced', name: 'Balanced Vault', contract: 'vault-stx-v2', assetName: 'vault-shares', apy: 14.2 },
  { id: 'conservative', name: 'Conservative Vault', contract: 'vault-conservative', assetName: 'vault-shares-conservative', apy: 8.5 },
  { id: 'growth', name: 'Growth Vault', contract: 'vault-growth', assetName: 'vault-shares-growth', apy: 21.8 },
];

export function PortfolioSummary({ userAddress }: PortfolioSummaryProps) {
  const [positions, setPositions] = useState<VaultPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!userAddress) {
      setPositions([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch all token balances for the user
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${userAddress}/balances`
      );
      const data = await response.json();

      const fetchedPositions: VaultPosition[] = [];

      for (const vault of vaultConfigs) {
        const assetId = `${CONTRACT_ADDRESS}.${vault.contract}::${vault.assetName}`;

        let shares = 0;
        if (data.fungible_tokens && data.fungible_tokens[assetId]) {
          shares = parseInt(data.fungible_tokens[assetId].balance) || 0;
        }

        if (shares > 0) {
          fetchedPositions.push({
            vaultId: vault.id,
            name: vault.name,
            shares: shares,
            estimatedValue: shares / 1_000_000, // 1:1 share price assumption
            apy: vault.apy,
          });
        }
      }

      setPositions(fetchedPositions);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Fetch on mount and periodically
  useEffect(() => {
    fetchPositions();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  // Calculate totals
  const totalValue = positions.reduce((sum, p) => sum + p.estimatedValue, 0);
  const weightedAPY = positions.length > 0
    ? positions.reduce((sum, p) => sum + (p.estimatedValue * p.apy), 0) / totalValue
    : 0;

  // Estimate earnings (simple calculation assuming 1 month of yield)
  const estimatedEarnings = totalValue * (weightedAPY / 100) / 12;

  const hasPositions = positions.length > 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Portfolio Overview</h3>
        <button
          onClick={fetchPositions}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Total Value */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Total Deposited</div>
              <div className="text-lg font-bold text-white">
                {loading ? '...' : `${totalValue.toFixed(2)} STX`}
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Monthly Earnings */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Est. Monthly Earnings</div>
              <div className="text-lg font-bold text-emerald-400">
                {loading ? '...' : `+${estimatedEarnings.toFixed(4)} STX`}
              </div>
            </div>
          </div>
        </div>

        {/* Weighted APY */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Weighted APY</div>
              <div className="text-lg font-bold text-orange-400">
                {loading ? '...' : `${weightedAPY.toFixed(2)}%`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Position Breakdown */}
      {hasPositions && (
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <PieChart className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Position Breakdown</span>
          </div>
          <div className="space-y-2">
            {positions.map((position) => (
              <div
                key={position.vaultId}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div>
                  <div className="text-sm font-medium text-white">{position.name}</div>
                  <div className="text-xs text-gray-500">{position.apy}% APY</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {position.estimatedValue.toFixed(2)} STX
                  </div>
                  <div className="text-xs text-gray-500">
                    {((position.estimatedValue / totalValue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasPositions && !loading && (
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            No positions yet. Select a vault and deposit to start earning.
          </p>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
