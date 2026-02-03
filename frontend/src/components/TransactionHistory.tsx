import { useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useTransactionHistory, Transaction } from '../hooks/useTransactionHistory';

interface TransactionHistoryProps {
  userAddress: string;
  limit?: number;
  showFilter?: boolean;
  compact?: boolean;
}

const typeConfig = {
  deposit: {
    icon: ArrowDownCircle,
    label: 'Deposit',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  withdraw: {
    icon: ArrowUpCircle,
    label: 'Withdraw',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  harvest: {
    icon: Sparkles,
    label: 'Harvest',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  unknown: {
    icon: Clock,
    label: 'Transaction',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; color: string; animate?: boolean }> = {
  success: {
    icon: CheckCircle2,
    label: 'Confirmed',
    color: 'text-green-400',
  },
  pending: {
    icon: Loader2,
    label: 'Pending',
    color: 'text-yellow-400',
    animate: true,
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-red-400',
  },
};

const vaultNames: Record<string, string> = {
  conservative: 'Conservative',
  balanced: 'Balanced',
  growth: 'Growth',
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function TransactionHistory({
  userAddress,
  limit = 10,
  showFilter = true,
  compact = false,
}: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState<Transaction['type'] | 'all'>('all');

  const { data: transactions, isLoading, refetch, isRefetching } = useTransactionHistory(
    userAddress,
    { limit, filterType }
  );

  if (!userAddress) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6">
        <div className="text-center text-gray-400 py-8">
          Connect wallet to view transaction history
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transaction History</h3>
            {!compact && (
              <p className="text-sm text-gray-400">Your recent vault interactions</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filter Dropdown */}
          {showFilter && (
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdraw">Withdrawals</option>
                <option value="harvest">Harvests</option>
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-800">
        {isLoading ? (
          // Loading skeleton
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-800 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          transactions.map((tx) => {
            const typeConf = typeConfig[tx.type];
            const statusConf = statusConfig[tx.status];
            const TypeIcon = typeConf.icon;
            const StatusIcon = statusConf.icon;

            return (
              <div
                key={tx.txId}
                className="px-6 py-4 hover:bg-gray-800/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Type Icon & Details */}
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl ${typeConf.bgColor} border ${typeConf.borderColor}`}>
                      <TypeIcon className={`w-5 h-5 ${typeConf.color}`} />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{typeConf.label}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                          {vaultNames[tx.vaultId]}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-400">
                          {formatTimeAgo(tx.timestamp)}
                        </span>
                        {tx.blockHeight && (
                          <span className="text-xs text-gray-500">
                            Block #{tx.blockHeight.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status */}
                  <div className="flex items-center space-x-4">
                    {/* Amount */}
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === 'deposit' ? 'text-green-400' : tx.type === 'withdraw' ? 'text-orange-400' : 'text-purple-400'}`}>
                        {tx.type === 'deposit' ? '+' : tx.type === 'withdraw' ? '-' : '+'}
                        {formatAmount(tx.amount)} STX
                      </div>
                      {!compact && (
                        <div className="text-xs text-gray-500">
                          ~${(tx.amount * 1.5).toFixed(2)} USD
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className={`flex items-center space-x-1.5 ${statusConf.color}`}>
                      <StatusIcon className={`w-4 h-4 ${statusConf.animate ? 'animate-spin' : ''}`} />
                      {!compact && (
                        <span className="text-xs font-medium">{statusConf.label}</span>
                      )}
                    </div>

                    {/* Explorer Link */}
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Empty state
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-gray-800/50 rounded-2xl mb-4">
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No transactions yet</h4>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Your deposit, withdrawal, and harvest transactions will appear here once you start using the vaults.
            </p>
          </div>
        )}
      </div>

      {/* Footer - View All Link */}
      {transactions && transactions.length > 0 && !compact && (
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
          <a
            href={`https://explorer.hiro.so/address/${userAddress}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            <span>View all on Explorer</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
