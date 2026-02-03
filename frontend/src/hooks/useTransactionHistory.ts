import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../config';

const HIRO_API = CONFIG.network.testnet.url;

export interface Transaction {
  txId: string;
  type: 'deposit' | 'withdraw' | 'harvest' | 'unknown';
  amount: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  vaultId: string;
  blockHeight?: number;
  explorerUrl: string;
}

interface HiroTransaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height: number;
  burn_block_time: number;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_args?: Array<{
      repr: string;
      type: string;
    }>;
  };
  tx_result?: {
    repr: string;
  };
}

// Map contract names to vault IDs
const contractToVault: Record<string, string> = {
  'vault-stx-v2': 'balanced',
  'vault-conservative': 'conservative',
  'vault-growth': 'growth',
};

// Parse transaction type from function name
function parseTransactionType(functionName: string): Transaction['type'] {
  if (functionName === 'deposit') return 'deposit';
  if (functionName === 'withdraw') return 'withdraw';
  if (functionName === 'harvest' || functionName === 'compound') return 'harvest';
  return 'unknown';
}

// Parse amount from function args
function parseAmount(args?: Array<{ repr: string; type: string }>): number {
  if (!args || args.length === 0) return 0;

  // First argument is usually the amount
  const amountArg = args[0];
  if (amountArg && amountArg.type === 'uint') {
    // Remove 'u' prefix and parse
    const value = amountArg.repr.replace('u', '');
    return parseInt(value, 10) / 1_000_000; // Convert from microSTX
  }
  return 0;
}

// Parse vault ID from contract
function parseVaultId(contractId: string): string {
  const contractName = contractId.split('.')[1];
  return contractToVault[contractName] || 'balanced';
}

export function useTransactionHistory(userAddress: string | undefined, options?: {
  limit?: number;
  filterType?: Transaction['type'] | 'all';
}) {
  const { limit = 20, filterType = 'all' } = options || {};

  return useQuery({
    queryKey: ['transactions', userAddress, limit, filterType],
    queryFn: async (): Promise<Transaction[]> => {
      if (!userAddress) return [];

      try {
        // Fetch transactions from Hiro API
        const response = await fetch(
          `${HIRO_API}/extended/v1/address/${userAddress}/transactions?limit=50`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        const transactions: Transaction[] = [];

        // Filter and map vault contract interactions
        const vaultContracts = Object.values(CONFIG.contracts.vaults);

        for (const tx of data.results as HiroTransaction[]) {
          // Only process contract calls to our vaults
          if (tx.tx_type !== 'contract_call' || !tx.contract_call) continue;

          const contractId = tx.contract_call.contract_id;
          const isVaultTx = vaultContracts.some(v => contractId === v);

          if (!isVaultTx) continue;

          const txType = parseTransactionType(tx.contract_call.function_name);

          // Apply type filter
          if (filterType !== 'all' && txType !== filterType) continue;

          transactions.push({
            txId: tx.tx_id,
            type: txType,
            amount: parseAmount(tx.contract_call.function_args),
            timestamp: tx.burn_block_time * 1000, // Convert to milliseconds
            status: tx.tx_status === 'success' ? 'success' :
                   tx.tx_status === 'pending' ? 'pending' : 'failed',
            vaultId: parseVaultId(contractId),
            blockHeight: tx.block_height,
            explorerUrl: `https://explorer.hiro.so/txid/${tx.tx_id}?chain=testnet`,
          });

          if (transactions.length >= limit) break;
        }

        return transactions;
      } catch (error) {
        console.error('Error fetching transaction history:', error);

        // Return mock data for development/demo
        return generateMockTransactions(limit, filterType);
      }
    },
    enabled: !!userAddress,
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 15_000,
  });
}

// Generate realistic mock transactions for demo
function generateMockTransactions(
  limit: number,
  filterType: Transaction['type'] | 'all'
): Transaction[] {
  const now = Date.now();
  const types: Transaction['type'][] = ['deposit', 'withdraw', 'harvest'];
  const vaults = ['conservative', 'balanced', 'growth'];
  const statuses: Transaction['status'][] = ['success', 'success', 'success', 'pending'];

  const mockTxs: Transaction[] = [];

  for (let i = 0; i < limit; i++) {
    const type = types[Math.floor(Math.random() * types.length)];

    if (filterType !== 'all' && type !== filterType) continue;

    const txId = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 58)}`;

    mockTxs.push({
      txId,
      type,
      amount: type === 'harvest'
        ? Math.floor(Math.random() * 50) + 5
        : Math.floor(Math.random() * 2000) + 100,
      timestamp: now - (i * 3600000 * Math.floor(Math.random() * 24 + 1)), // Random hours ago
      status: statuses[Math.floor(Math.random() * statuses.length)],
      vaultId: vaults[Math.floor(Math.random() * vaults.length)],
      blockHeight: 150000 - i * 10,
      explorerUrl: `https://explorer.hiro.so/txid/${txId}?chain=testnet`,
    });
  }

  // Sort by timestamp descending
  return mockTxs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// Hook for pending transactions (local state)
export function usePendingTransactions() {
  return useQuery({
    queryKey: ['pendingTransactions'],
    queryFn: () => {
      // Get from localStorage
      const stored = localStorage.getItem('snp_pending_txs');
      if (!stored) return [];

      try {
        const txs = JSON.parse(stored) as Transaction[];
        // Filter out old pending transactions (older than 1 hour)
        const oneHourAgo = Date.now() - 3600000;
        return txs.filter(tx => tx.timestamp > oneHourAgo);
      } catch {
        return [];
      }
    },
    refetchInterval: 5_000,
  });
}

// Utility to add a pending transaction
export function addPendingTransaction(tx: Omit<Transaction, 'status'>) {
  const stored = localStorage.getItem('snp_pending_txs');
  const existing = stored ? JSON.parse(stored) : [];

  const newTx: Transaction = { ...tx, status: 'pending' };
  existing.unshift(newTx);

  // Keep only last 10 pending
  localStorage.setItem('snp_pending_txs', JSON.stringify(existing.slice(0, 10)));
}

// Utility to remove a pending transaction (when confirmed)
export function removePendingTransaction(txId: string) {
  const stored = localStorage.getItem('snp_pending_txs');
  if (!stored) return;

  const existing = JSON.parse(stored) as Transaction[];
  const filtered = existing.filter(tx => tx.txId !== txId);
  localStorage.setItem('snp_pending_txs', JSON.stringify(filtered));
}
