import { useState, useEffect, useCallback } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Wallet, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { UserSession } from '@stacks/connect';
import { useVaultContract } from '../hooks/useVaultContract';
import { CONFIG } from '../config';

interface VaultManagementPanelProps {
  selectedVault: string;
  userAddress: string;
  userSession: UserSession;
}

const vaultContractMap: Record<string, string> = {
  conservative: 'vault-conservative',
  balanced: 'vault-stx-v2',
  growth: 'vault-growth',
};

const vaultInfo: Record<string, { name: string; token: string; apy: string }> = {
  conservative: { name: 'Conservative Vault', token: 'snSTX-CONS', apy: '8-10%' },
  balanced: { name: 'Balanced Vault', token: 'snSTX', apy: '12-16%' },
  growth: { name: 'Growth Vault', token: 'snSTX-GRTH', apy: '18-25%' },
};

export function VaultManagementPanel({ selectedVault, userAddress, userSession }: VaultManagementPanelProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [stxBalance, setStxBalance] = useState<number | null>(null);
  const [shareBalance, setShareBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const vault = vaultInfo[selectedVault] || vaultInfo.balanced;
  const vaultContract = vaultContractMap[selectedVault] || 'vault-stx-v2';

  const { deposit, withdraw, getShareBalance, loading, error, txId } = useVaultContract(userSession);

  // Fetch STX balance
  const fetchStxBalance = useCallback(async () => {
    if (!userAddress) {
      setStxBalance(null);
      return;
    }

    setBalanceLoading(true);
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${userAddress}/balances`
      );
      const data = await response.json();
      setStxBalance(parseInt(data.stx.balance) || 0);
    } catch (err) {
      console.error('Failed to fetch STX balance:', err);
      setStxBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  }, [userAddress]);

  // Fetch share balance
  const fetchShareBalance = useCallback(async () => {
    if (!userAddress || !userSession.isUserSignedIn()) {
      setShareBalance(null);
      return;
    }

    try {
      const shares = await getShareBalance(vaultContract);
      setShareBalance(shares);
    } catch (err) {
      console.error('Failed to fetch share balance:', err);
      setShareBalance(0);
    }
  }, [userAddress, userSession, vaultContract, getShareBalance]);

  // Fetch balances on mount and when vault changes
  useEffect(() => {
    fetchStxBalance();
    fetchShareBalance();
  }, [fetchStxBalance, fetchShareBalance]);

  // Refetch balances after successful transaction
  useEffect(() => {
    if (txId) {
      // Wait a bit then refetch balances
      const timer = setTimeout(() => {
        fetchStxBalance();
        fetchShareBalance();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [txId, fetchStxBalance, fetchShareBalance]);

  const handleMaxClick = () => {
    if (mode === 'deposit' && stxBalance !== null) {
      // Reserve 0.1 STX for gas fees
      const maxAmount = Math.max(0, (stxBalance - 100000) / 1_000_000);
      setAmount(maxAmount.toFixed(6));
    } else if (mode === 'withdraw' && shareBalance !== null) {
      const maxShares = shareBalance / 1_000_000;
      setAmount(maxShares.toFixed(6));
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const amountMicroSTX = Math.floor(parseFloat(amount) * 1_000_000);

    await deposit({
      vaultContract,
      amount: amountMicroSTX,
    });

    // Clear amount on success
    if (!error) {
      setAmount('');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const sharesMicro = Math.floor(parseFloat(amount) * 1_000_000);
    const slippagePercent = parseFloat(slippage) / 100;

    // Account for 8% performance fee
    const performanceFeeFactor = 0.92;
    const expectedAssetsAfterFee = sharesMicro * performanceFeeFactor;
    const minAssets = Math.floor(expectedAssetsAfterFee * (1 - slippagePercent));
    const deadline = 999999999;

    await withdraw({
      vaultContract,
      shares: sharesMicro,
      minAssets,
      deadline,
    });

    // Clear amount on success
    if (!error) {
      setAmount('');
    }
  };

  const formatBalance = (balance: number | null, decimals: number = 2) => {
    if (balance === null) return '---';
    return (balance / 1_000_000).toFixed(decimals);
  };

  const isButtonDisabled = !userAddress || loading || !amount || parseFloat(amount) <= 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Manage Position</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>{vault.name}</span>
          <span className="text-gray-600">|</span>
          <span className="text-orange-400">{vault.apy} APY</span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex space-x-2 mb-6 bg-gray-800/50 rounded-lg p-1">
        <button
          onClick={() => { setMode('deposit'); setAmount(''); }}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
            mode === 'deposit'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit</span>
          </div>
        </button>
        <button
          onClick={() => { setMode('withdraw'); setAmount(''); }}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
            mode === 'withdraw'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowUpCircle className="w-4 h-4" />
            <span>Withdraw</span>
          </div>
        </button>
      </div>

      {/* Your Position */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Your Position</span>
          <Wallet className="w-4 h-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {balanceLoading ? (
            <span className="text-gray-500">Loading...</span>
          ) : (
            `${formatBalance(shareBalance, 6)} ${vault.token}`
          )}
        </div>
        <div className="text-sm text-gray-400">
          {shareBalance && shareBalance > 0
            ? `Vault shares (1:1 with deposited STX)`
            : 'No position yet'}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-400">
            {mode === 'deposit' ? 'Amount (STX)' : 'Shares to Withdraw'}
          </label>
          <button
            onClick={handleMaxClick}
            disabled={loading || balanceLoading}
            className="text-xs font-medium text-orange-400 hover:text-orange-300 disabled:text-gray-600"
          >
            MAX
          </button>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {mode === 'deposit' ? 'STX' : 'SHARES'}
          </span>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>
            {mode === 'deposit'
              ? `Available: ${formatBalance(stxBalance)} STX`
              : `Available: ${formatBalance(shareBalance, 6)} Shares`}
          </span>
          <span>Min: 1 STX</span>
        </div>
      </div>

      {/* Slippage Tolerance (for withdrawals) */}
      {mode === 'withdraw' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Slippage Tolerance
          </label>
          <div className="flex gap-2">
            {['0.5', '1', '2'].map((val) => (
              <button
                key={val}
                onClick={() => setSlippage(val)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  slippage === val
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {val}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
              step="0.1"
              min="0.1"
              max="50"
              placeholder="Custom"
            />
          </div>
          {amount && parseFloat(amount) > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Min receive: {(parseFloat(amount) * 0.92 * (1 - parseFloat(slippage) / 100)).toFixed(6)} STX (after 8% fee + {slippage}% slippage)
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={mode === 'deposit' ? handleDeposit : handleWithdraw}
        disabled={isButtonDisabled}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : !userAddress ? (
          <span>Connect Wallet First</span>
        ) : !amount || parseFloat(amount) <= 0 ? (
          <span>Enter Amount</span>
        ) : (
          <span>{mode === 'deposit' ? `Deposit ${amount} STX` : `Withdraw ${amount} Shares`}</span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Transaction Failed</p>
              <p className="text-xs text-red-400/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {txId && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-400">Transaction Submitted!</p>
              <p className="text-xs text-green-400/80 mt-1">
                Your transaction is being processed. It may take 2-5 minutes to confirm.
              </p>
              <a
                href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 mt-2 text-xs font-medium text-green-400 hover:text-green-300"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-400">
          Contract: {CONFIG.contracts.vaults[selectedVault as keyof typeof CONFIG.contracts.vaults] || 'Unknown'}
        </p>
        <p className="text-xs text-blue-400/70 mt-1">
          Network: Stacks Testnet | 8% Performance Fee (on profits only)
        </p>
      </div>
    </div>
  );
}
