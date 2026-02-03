import { useState, useRef, useCallback } from 'react';
import { TrendingUp, Shield, Layers } from 'lucide-react';
import { formatAPY } from './utils/formatting';
import { VaultCards } from './components/vaults/VaultCards';
import { VaultManagementPanel } from './components/VaultManagementPanel';
import { PortfolioSummary } from './components/PortfolioSummary';
import { TransactionHistory } from './components/TransactionHistory';
import { PerformanceChart } from './components/PerformanceChart';
import { useWallet } from './hooks/useWallet';

function App() {
  // Wallet Integration
  const { isConnected, address, loading, connectWallet, disconnectWallet, userSession } = useWallet();

  // Vault Selection
  const [selectedVault, setSelectedVault] = useState('balanced');
  const [averageAPY] = useState(14.9);

  // Ref for scroll-to-management
  const managementRef = useRef<HTMLDivElement>(null);

  // Handle vault selection with scroll
  const handleVaultSelect = useCallback((vaultId: string) => {
    setSelectedVault(vaultId);

    // Scroll to management panel after a brief delay
    setTimeout(() => {
      managementRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, []);

  // Format address for display
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-lg opacity-50"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SNP</h1>
                <p className="text-xs text-gray-400">Stacks Yield Aggregator</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Network Indicator */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">Testnet</span>
              </div>

              {/* Wallet Button */}
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
                >
                  <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-400 mb-0.5">Connected</div>
                    <div className="text-sm text-white font-mono">{displayAddress}</div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isConnected ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live on Stacks Testnet</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Automated{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Yield Optimization
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Multi-strategy DeFi vault protocol on Stacks. Deposit once, earn optimized yields across 12+ strategies with automated rebalancing.
              </p>
            </div>

            {/* Protocol Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Protocol TVL */}
              <div className="bg-gradient-to-br from-blue-950/30 via-gray-900 to-gray-900 border border-blue-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-400 px-3 py-1 bg-blue-500/10 rounded-full">
                    30d
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">$7.1M</div>
                <div className="text-sm text-gray-400">Total Value Locked</div>
                <div className="text-xs text-gray-500 mt-2">Across 3 vaults | 12 strategies</div>
              </div>

              {/* Average APY */}
              <div className="bg-gradient-to-br from-orange-950/30 via-gray-900 to-gray-900 border border-orange-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Shield className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full">
                    Live
                  </span>
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">{formatAPY(averageAPY)}</div>
                <div className="text-sm text-gray-400">Average Yield</div>
                <div className="text-xs text-gray-500 mt-2">Weighted across all positions</div>
              </div>

              {/* Active Strategies */}
              <div className="bg-gradient-to-br from-purple-950/30 via-gray-900 to-gray-900 border border-purple-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Layers className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-purple-400 px-3 py-1 bg-purple-500/10 rounded-full">
                    Auto
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">12</div>
                <div className="text-sm text-gray-400">Active Strategies</div>
                <div className="text-xs text-gray-500 mt-2">Automated rebalancing</div>
              </div>
            </div>

            {/* Vault Selection */}
            <VaultCards
              selectedVault={selectedVault}
              onVaultSelect={handleVaultSelect}
              userAddress={address || undefined}
            />

            {/* Portfolio & Management Section */}
            <div ref={managementRef} className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Portfolio Summary */}
                <div className="lg:col-span-1">
                  <PortfolioSummary
                    userAddress={address || ''}
                    userSession={userSession}
                  />
                </div>

                {/* Vault Management */}
                <div className="lg:col-span-2">
                  <VaultManagementPanel
                    selectedVault={selectedVault}
                    userAddress={address || ''}
                    userSession={userSession}
                  />
                </div>
              </div>
            </div>

            {/* Performance & History Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Chart */}
              <PerformanceChart
                vaultId={selectedVault}
                vaultName={selectedVault.charAt(0).toUpperCase() + selectedVault.slice(1)}
              />

              {/* Transaction History */}
              <TransactionHistory
                userAddress={address || ''}
                limit={8}
                showFilter={true}
              />
            </div>

            {/* Protocol Information */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-8 mt-12">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">How It Works</h3>
                <p className="text-gray-400 leading-relaxed">
                  SNP automatically allocates deposited assets across multiple DeFi strategies on Stacks.
                  Smart contracts monitor performance and rebalance positions to optimize returns while managing risk exposure.
                  All vaults are non-custodial—you retain complete control of your assets at all times.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">0%</div>
                    <div className="text-sm text-gray-400">Zero Fees</div>
                    <div className="text-xs text-gray-500 mt-1">Fully self-custodial</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">24h</div>
                    <div className="text-sm text-gray-400">Rebalance Cycle</div>
                    <div className="text-xs text-gray-500 mt-1">Automated execution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">0%</div>
                    <div className="text-sm text-gray-400">Deposit/Withdrawal Fee</div>
                    <div className="text-xs text-gray-500 mt-1">Enter and exit anytime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Welcome to SNP
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl">
                Automated yield optimization protocol for Stacks DeFi. Connect your wallet to view available vaults and start earning.
              </p>
            </div>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
              <div className="text-center p-6 bg-gray-900 border border-gray-800 rounded-xl">
                <div className="text-3xl font-bold text-emerald-400 mb-2">0%</div>
                <div className="text-sm text-gray-400">Zero Fees</div>
                <div className="text-xs text-gray-500 mt-2">No hidden costs</div>
              </div>
              <div className="text-center p-6 bg-gray-900 border border-gray-800 rounded-xl">
                <div className="text-3xl font-bold text-emerald-400 mb-2">24h</div>
                <div className="text-sm text-gray-400">Rebalancing</div>
                <div className="text-xs text-gray-500 mt-2">Fully automated</div>
              </div>
              <div className="text-center p-6 bg-gray-900 border border-gray-800 rounded-xl">
                <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
                <div className="text-sm text-gray-400">Non-Custodial</div>
                <div className="text-xs text-gray-500 mt-2">Your keys, your crypto</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Testnet Deployment</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="https://docs.stacks.co" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Stacks Docs</a>
              <a href="https://explorer.hiro.so/address/ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA?chain=testnet" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Explorer</a>
              <a href="https://github.com/mattglory/snp-mvp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <div className="text-xs text-gray-500">
              SNP Protocol 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
