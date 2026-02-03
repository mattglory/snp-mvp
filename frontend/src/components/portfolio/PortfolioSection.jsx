import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { formatCurrency } from '../../utils/formatting';
import { CONFIG } from '../../config';

// Get contract address from config (testnet deployer)
const getVaultContract = (vaultId) => {
  const vaultAddress = CONFIG.contracts.vaults[vaultId] || CONFIG.contracts.vaults.balanced;
  const [address, name] = vaultAddress.split('.');
  return { address, name };
};

const TransactionStatus = {
  IDLE: 'idle',
  PENDING: 'pending',
  CONFIRMING: 'confirming',
  SUCCESS: 'success',
  ERROR: 'error'
};

export function PortfolioSection({ vaultData, selectedVault, userData, onRefresh }) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');
  const [txStatus, setTxStatus] = useState(TransactionStatus.IDLE);
  const [txMessage, setTxMessage] = useState('');

  const balance = vaultData?.balance || 0;
  const shares = vaultData?.shares || 0;
  const sharePrice = vaultData?.sharePrice || 1;

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setTxStatus(TransactionStatus.ERROR);
      setTxMessage('Please enter a valid deposit amount');
      return;
    }

    setTxStatus(TransactionStatus.PENDING);
    setTxMessage('Waiting for wallet confirmation...');

    try {
      const amountInMicroSTX = Math.floor(parseFloat(depositAmount) * 1000000);
      const { address, name } = getVaultContract(selectedVault);

      await openContractCall({
        network: new StacksTestnet(),
        contractAddress: address,
        contractName: name,
        functionName: 'deposit',
        functionArgs: [uintCV(amountInMicroSTX)],
        onFinish: (data) => {
          setTxStatus(TransactionStatus.CONFIRMING);
          setTxMessage('Transaction submitted. Waiting for confirmation...');
          setDepositAmount('');
          
          setTimeout(() => {
            setTxStatus(TransactionStatus.SUCCESS);
            setTxMessage('Deposit successful! Your funds are now earning yield.');
            onRefresh();
            
            setTimeout(() => {
              setTxStatus(TransactionStatus.IDLE);
              setTxMessage('');
            }, 5000);
          }, 3000);
        },
        onCancel: () => {
          setTxStatus(TransactionStatus.ERROR);
          setTxMessage('Transaction cancelled');
          setTimeout(() => {
            setTxStatus(TransactionStatus.IDLE);
            setTxMessage('');
          }, 3000);
        },
      });
    } catch (error) {
      setTxStatus(TransactionStatus.ERROR);
      setTxMessage(`Deposit failed: ${error.message}`);
      setTimeout(() => {
        setTxStatus(TransactionStatus.IDLE);
        setTxMessage('');
      }, 5000);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawShares || parseFloat(withdrawShares) <= 0) {
      setTxStatus(TransactionStatus.ERROR);
      setTxMessage('Please enter valid shares to withdraw');
      return;
    }

    setTxStatus(TransactionStatus.PENDING);
    setTxMessage('Waiting for wallet confirmation...');

    try {
      const sharesAmount = Math.floor(parseFloat(withdrawShares));
      const minAmountOut = Math.floor(sharesAmount * sharePrice * 1000000 * 0.98);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const { address, name } = getVaultContract(selectedVault);

      await openContractCall({
        network: new StacksTestnet(),
        contractAddress: address,
        contractName: name,
        functionName: 'withdraw',
        functionArgs: [uintCV(sharesAmount), uintCV(minAmountOut), uintCV(deadline)],
        onFinish: (data) => {
          setTxStatus(TransactionStatus.CONFIRMING);
          setTxMessage('Transaction submitted. Processing withdrawal...');
          setWithdrawShares('');
          
          setTimeout(() => {
            setTxStatus(TransactionStatus.SUCCESS);
            setTxMessage('Withdrawal successful! Funds returned to your wallet.');
            onRefresh();
            
            setTimeout(() => {
              setTxStatus(TransactionStatus.IDLE);
              setTxMessage('');
            }, 5000);
          }, 3000);
        },
        onCancel: () => {
          setTxStatus(TransactionStatus.ERROR);
          setTxMessage('Transaction cancelled');
          setTimeout(() => {
            setTxStatus(TransactionStatus.IDLE);
            setTxMessage('');
          }, 3000);
        },
      });
    } catch (error) {
      setTxStatus(TransactionStatus.ERROR);
      setTxMessage(`Withdrawal failed: ${error.message}`);
      setTimeout(() => {
        setTxStatus(TransactionStatus.IDLE);
        setTxMessage('');
      }, 5000);
    }
  };

  const StatusIcon = () => {
    switch (txStatus) {
      case TransactionStatus.PENDING:
      case TransactionStatus.CONFIRMING:
        return <RefreshCw className="w-5 h-5 animate-spin" />;
      case TransactionStatus.SUCCESS:
        return <CheckCircle2 className="w-5 h-5" />;
      case TransactionStatus.ERROR:
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const statusColors = {
    [TransactionStatus.PENDING]: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    [TransactionStatus.CONFIRMING]: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    [TransactionStatus.SUCCESS]: 'bg-green-500/10 text-green-400 border-green-500/30',
    [TransactionStatus.ERROR]: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Portfolio Summary */}
      <div className="lg:col-span-1 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Your Position</h3>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="pb-4 border-b border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Deposited</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(balance, 'STX')}
            </div>
          </div>

          <div className="pb-4 border-b border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Your Shares</div>
            <div className="text-2xl font-bold text-white">
              {shares.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ≈ {formatCurrency(shares * sharePrice / 1000000, 'STX')}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">Share Price</div>
            <div className="text-lg font-semibold text-white">
              {(sharePrice / 1000000).toFixed(6)} STX
            </div>
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw */}
      <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 p-1 bg-gray-800/50 rounded-lg">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md transition-all ${
              activeTab === 'deposit'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span className="font-medium">Deposit</span>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md transition-all ${
              activeTab === 'withdraw'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span className="font-medium">Withdraw</span>
          </button>
        </div>

        {/* Transaction Status */}
        {txStatus !== TransactionStatus.IDLE && (
          <div className={`flex items-center space-x-3 p-4 mb-6 rounded-lg border ${statusColors[txStatus]}`}>
            <StatusIcon />
            <span className="text-sm">{txMessage}</span>
          </div>
        )}

        {/* Deposit Form */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (STX)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                step="0.1"
                min="0"
                disabled={txStatus === TransactionStatus.PENDING || txStatus === TransactionStatus.CONFIRMING}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Min deposit: 1000 STX
                </p>
                <button
                  onClick={() => setDepositAmount('1000')}
                  className="text-xs text-orange-400 hover:text-orange-300"
                >
                  Use min
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  Your deposit will be automatically allocated across 12 protocols in the <span className="font-semibold text-white">{selectedVault}</span> vault strategy.
                </div>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={!depositAmount || parseFloat(depositAmount) < 1000 || txStatus === TransactionStatus.PENDING || txStatus === TransactionStatus.CONFIRMING}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
            >
              {txStatus === TransactionStatus.PENDING || txStatus === TransactionStatus.CONFIRMING ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Deposit & Start Earning</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Withdraw Form */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shares to Withdraw
              </label>
              <input
                type="number"
                value={withdrawShares}
                onChange={(e) => setWithdrawShares(e.target.value)}
                placeholder="0"
                step="1"
                min="0"
                max={shares}
                disabled={txStatus === TransactionStatus.PENDING || txStatus === TransactionStatus.CONFIRMING}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Available: {shares.toLocaleString()} shares (≈{formatCurrency(shares * sharePrice / 1000000, 'STX')})
                </p>
                <button
                  onClick={() => setWithdrawShares(shares.toString())}
                  className="text-xs text-orange-400 hover:text-orange-300"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">You will receive:</span>
                  <span className="font-semibold text-white">
                    ≈{formatCurrency(parseFloat(withdrawShares || 0) * sharePrice / 1000000, 'STX')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance fee (8%):</span>
                  <span className="text-gray-400">
                    {formatCurrency(parseFloat(withdrawShares || 0) * sharePrice / 1000000 * 0.08, 'STX')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={!withdrawShares || parseFloat(withdrawShares) <= 0 || parseFloat(withdrawShares) > shares || txStatus === TransactionStatus.PENDING || txStatus === TransactionStatus.CONFIRMING}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
            >
              {txStatus === TransactionStatus.PENDING || txStatus === TransactionStatus.CONFIRMING ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Withdraw</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
