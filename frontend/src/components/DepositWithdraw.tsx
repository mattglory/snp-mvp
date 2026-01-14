import { useState, useEffect } from 'react';
import { useVaultContract } from '../hooks/useVaultContract';
import { UserSession } from '@stacks/connect';

interface DepositWithdrawProps {
  vaultContract: string;
  vaultName: string;
  userSession: UserSession;
  isConnected: boolean;
}

export function DepositWithdraw({
  vaultContract,
  vaultName,
  userSession,
  isConnected,
}: DepositWithdrawProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1'); // 1% default
  const [stxBalance, setStxBalance] = useState<number | null>(null);

  const { deposit, withdraw, loading, error, txId } = useVaultContract(userSession);

  // Fetch user's STX balance
  useEffect(() => {
    if (!isConnected || !userSession.isUserSignedIn()) {
      setStxBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const userData = userSession.loadUserData();
        const address = userData.profile.stxAddress.testnet;

        const response = await fetch(
          `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`
        );
        const data = await response.json();
        setStxBalance(parseInt(data.stx.balance));
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [isConnected, userSession]);

  const handleMaxClick = () => {
    if (stxBalance !== null) {
      // Reserve 0.1 STX for gas fees
      const maxAmount = Math.max(0, (stxBalance - 100000) / 1_000_000);
      setAmount(maxAmount.toFixed(6));
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    const amountMicroSTX = Math.floor(parseFloat(amount) * 1_000_000);
    const slippagePercent = parseFloat(slippage) / 100;
    const minShares = Math.floor(amountMicroSTX * (1 - slippagePercent));

    // Set deadline to 100 blocks from now (roughly 16 hours on testnet)
    const deadline = 999999999; // Far future for testing

    await deposit({
      vaultContract,
      amount: amountMicroSTX,
      minShares,
      deadline,
    });
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    const sharesMicro = Math.floor(parseFloat(amount) * 1_000_000);
    const slippagePercent = parseFloat(slippage) / 100;
    const minAssets = Math.floor(sharesMicro * (1 - slippagePercent));
    const deadline = 999999999;

    await withdraw({
      vaultContract,
      shares: sharesMicro,
      minAssets,
      deadline,
    });
  };

  return (
    <div className="card animate-slideDown">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold gradient-text">{vaultName}</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-xs text-gray-400">Testnet</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-6 p-1 bg-dark-bg rounded-xl">
        <button
          onClick={() => setMode('deposit')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            mode === 'deposit'
              ? 'bg-bitcoin-orange text-white shadow-bitcoin'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>📥</span>
            <span>Deposit</span>
          </div>
        </button>
        <button
          onClick={() => setMode('withdraw')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            mode === 'withdraw'
              ? 'bg-bitcoin-orange text-white shadow-bitcoin'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>📤</span>
            <span>Withdraw</span>
          </div>
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-300">
            {mode === 'deposit' ? 'Amount (STX)' : 'Shares to Withdraw'}
          </label>
          {mode === 'deposit' && stxBalance !== null && (
            <button
              onClick={handleMaxClick}
              disabled={loading}
              className="px-3 py-1 bg-bitcoin-orange/10 hover:bg-bitcoin-orange/20 text-bitcoin-orange text-xs font-semibold rounded-lg transition-all"
            >
              MAX
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-dark-bg border-2 border-dark-border rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-bitcoin-orange transition-all duration-200 placeholder-gray-600"
            disabled={!isConnected || loading}
            step="0.000001"
            min="0"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="text-gray-400 font-semibold">
              {mode === 'deposit' ? 'STX' : 'SHARES'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          {amount && parseFloat(amount) > 0 && (
            <div className="text-xs text-gray-400">
              ≈ {parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              {mode === 'deposit' ? ' STX' : ' shares'}
            </div>
          )}
          {mode === 'deposit' && stxBalance !== null && (
            <div className="text-xs text-gray-500">
              Balance: {(stxBalance / 1_000_000).toFixed(2)} STX
            </div>
          )}
        </div>
      </div>

      {/* Slippage */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Slippage Tolerance
        </label>
        <div className="flex gap-2">
          {['0.5', '1', '2'].map((val) => (
            <button
              key={val}
              onClick={() => setSlippage(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                slippage === val
                  ? 'bg-bitcoin-orange text-white shadow-bitcoin'
                  : 'bg-dark-bg text-gray-400 hover:text-white hover:bg-dark-surface'
              }`}
              disabled={loading}
            >
              {val}%
            </button>
          ))}
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="flex-1 bg-dark-bg border-2 border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-bitcoin-orange transition-all"
            disabled={loading}
            step="0.1"
            min="0.1"
            max="50"
            placeholder="Custom"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Your transaction will revert if the price changes more than {slippage}%
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={mode === 'deposit' ? handleDeposit : handleWithdraw}
        disabled={!isConnected || loading || !amount || parseFloat(amount) <= 0}
        className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none relative overflow-hidden group"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Transaction...</span>
          </div>
        ) : !isConnected ? (
          <span>Connect Wallet First</span>
        ) : !amount || parseFloat(amount) <= 0 ? (
          <span>Enter Amount</span>
        ) : mode === 'deposit' ? (
          <div className="flex items-center justify-center gap-2">
            <span>Deposit {amount} STX</span>
            <span className="text-xl">→</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Withdraw {amount} Shares</span>
            <span className="text-xl">→</span>
          </div>
        )}
      </button>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-4 bg-error/10 border-2 border-error/50 rounded-xl text-error animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold mb-1">Transaction Failed</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        </div>
      )}

      {txId && (
        <div className="mt-4 p-4 bg-success/10 border-2 border-success/50 rounded-xl text-success animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-semibold mb-2">Transaction Submitted!</p>
              <p className="text-sm opacity-90 mb-3">
                Your transaction has been broadcast to the network. It may take 2-5 minutes to confirm.
              </p>
              <a
                href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-success-dark transition-all"
              >
                <span>View on Explorer</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="mt-6 p-4 bg-dark-bg/50 rounded-xl">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500">Contract:</span>
            <p className="text-gray-300 font-mono mt-1 truncate">{vaultContract}</p>
          </div>
          <div>
            <span className="text-gray-500">Network:</span>
            <p className="text-gray-300 font-semibold mt-1">Stacks Testnet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
