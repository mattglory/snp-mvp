import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useVaultData } from '../../hooks/useVaultData';
import { formatTokenAmount } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface DepositWithdrawPanelProps {
  vaultId: string;
  userAddress?: string;
}

type ActionType = 'deposit' | 'withdraw';
type TransactionState = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export function DepositWithdrawPanel({ vaultId, userAddress }: DepositWithdrawPanelProps) {
  const [activeTab, setActiveTab] = useState<ActionType>('deposit');
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txHash, setTxHash] = useState('');

  const { data: vaultData, refetch } = useVaultData(vaultId, userAddress);

  // Mock available balance - replace with real data
  const availableSTX = 7309767.11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!userAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    const numAmount = parseFloat(amount);
    
    if (activeTab === 'deposit' && numAmount > availableSTX) {
      toast.error('Insufficient balance');
      return;
    }

    if (activeTab === 'withdraw' && numAmount > (vaultData?.userBalance || 0)) {
      toast.error('Insufficient vault balance');
      return;
    }

    try {
      setTxState('pending');
      toast.loading('Confirm transaction in wallet...', { id: 'tx' });
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTxState('confirming');
      toast.loading('Transaction confirming...', { id: 'tx' });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 10);
      setTxHash(mockTxHash);
      setTxState('success');
      toast.success(`${activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`, { id: 'tx' });
      
      // Reset form
      setAmount('');
      
      // Refetch vault data
      setTimeout(() => {
        refetch();
      }, 1000);
      
    } catch (error) {
      setTxState('error');
      toast.error('Transaction failed', { id: 'tx' });
      console.error('Transaction error:', error);
    }
  };

  const handleMaxClick = () => {
    if (activeTab === 'deposit') {
      setAmount(availableSTX.toString());
    } else {
      setAmount((vaultData?.userBalance || 0).toString());
    }
  };

  const resetTxState = () => {
    setTxState('idle');
    setTxHash('');
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Tab Buttons */}
      <div className="grid grid-cols-2 border-b border-gray-800">
        <button
          onClick={() => {
            setActiveTab('deposit');
            resetTxState();
          }}
          className={`
            flex items-center justify-center space-x-2 py-4 font-semibold transition-all
            ${activeTab === 'deposit' 
              ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'}
          `}
        >
          <ArrowDownCircle className="w-5 h-5" />
          <span>Deposit</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw');
            resetTxState();
          }}
          className={`
            flex items-center justify-center space-x-2 py-4 font-semibold transition-all
            ${activeTab === 'withdraw' 
              ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'}
          `}
        >
          <ArrowUpCircle className="w-5 h-5" />
          <span>Withdraw</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {txState === 'idle' && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (STX)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Balance Info */}
              <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-white font-semibold">
                    {activeTab === 'deposit' 
                      ? formatTokenAmount(availableSTX, 2)
                      : formatTokenAmount(vaultData?.userBalance || 0, 2)} STX
                  </span>
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-700">
                    <span className="text-gray-400">You will {activeTab === 'deposit' ? 'receive' : 'withdraw'}:</span>
                    <span className="text-orange-400 font-semibold">
                      ~{formatTokenAmount(parseFloat(amount), 2)} sn{vaultId.toUpperCase().slice(0, 4)}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!userAddress || !amount || parseFloat(amount) <= 0}
                className={`
                  w-full py-3 rounded-lg font-semibold transition-all
                  ${!userAddress || !amount || parseFloat(amount) <= 0
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : activeTab === 'deposit'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'}
                `}
              >
                {!userAddress 
                  ? 'Connect Wallet' 
                  : `${activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} STX`}
              </button>

              {/* Info Note */}
              <p className="text-xs text-gray-500 text-center">
                {activeTab === 'deposit' 
                  ? 'Minimum first deposit: 1000 STX' 
                  : '8% performance fee on withdrawals'}
              </p>
            </motion.form>
          )}

          {(txState === 'pending' || txState === 'confirming') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {txState === 'pending' ? 'Confirm in Wallet' : 'Confirming Transaction'}
                </h3>
                <p className="text-sm text-gray-400">
                  {txState === 'pending' 
                    ? 'Please confirm the transaction in your wallet' 
                    : 'Transaction is being confirmed on the blockchain...'}
                </p>
              </div>
            </motion.div>
          )}

          {txState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Transaction Successful!
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Your {activeTab} has been processed
                </p>
                {txHash && (
                  <a
                    href={`https://explorer.hiro.so/txid/${txHash}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-400 hover:text-orange-300 underline"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
              <button
                onClick={resetTxState}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Make Another Transaction
              </button>
            </motion.div>
          )}

          {txState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <XCircle className="w-16 h-16 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Transaction Failed
                </h3>
                <p className="text-sm text-gray-400">
                  Please try again or contact support if the issue persists
                </p>
              </div>
              <button
                onClick={resetTxState}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
