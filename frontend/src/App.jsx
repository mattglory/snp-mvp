import { useState, useEffect } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import { Header } from './components/layout/Header';
import { VaultCards } from './components/vaults/VaultCards';
import { ConnectPrompt } from './components/layout/ConnectPrompt';
import { TrendingUp, Shield, Layers } from 'lucide-react';

function App() {
  // Initialize UserSession
  const [userSession] = useState(() => {
    try {
      const appConfig = new AppConfig(['store_write', 'publish_data']);
      return new UserSession({ appConfig });
    } catch (error) {
      console.warn('UserSession initialization warning:', error);
      return new UserSession({ appConfig: new AppConfig(['store_write', 'publish_data']) });
    }
  });
  
  const [userData, setUserData] = useState(null);
  const [selectedVault, setSelectedVault] = useState('balanced');

  // Load user session
  useEffect(() => {
    try {
      if (userSession && userSession.isUserSignedIn && userSession.isUserSignedIn()) {
        const data = userSession.loadUserData();
        setUserData(data);
      }
    } catch (error) {
      console.warn('Error loading user session:', error);
    }
  }, [userSession]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <Header 
        userData={userData}
        userSession={userSession}
        onUserDataChange={setUserData}
      />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userData ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live on Stacks Testnet</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Bitcoin's Intelligent{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Yield Aggregator
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Automated DeFi strategies across 12+ protocols. Set it, forget it, and watch your STX grow.
              </p>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Protocol TVL */}
              <div className="bg-gradient-to-br from-blue-950/30 via-gray-900 to-gray-900 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-400 px-3 py-1 bg-blue-500/10 rounded-full">
                    +12.3%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">$7.1M</div>
                <div className="text-sm text-gray-400">Total Value Locked</div>
                <div className="text-xs text-gray-500 mt-2">Across 3 vaults • 12 strategies</div>
              </div>

              {/* Average APY */}
              <div className="bg-gradient-to-br from-orange-950/30 via-gray-900 to-gray-900 border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Shield className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full">
                    Live
                  </span>
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">14.90%</div>
                <div className="text-sm text-gray-400">Protocol Average APY</div>
                <div className="text-xs text-gray-500 mt-2">8-25% range depending on vault</div>
              </div>

              {/* Active Strategies */}
              <div className="bg-gradient-to-br from-purple-950/30 via-gray-900 to-gray-900 border border-purple-500/20 rounded-2xl p-6">
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
                <div className="text-xs text-gray-500 mt-2">Rebalanced every 24 hours</div>
              </div>
            </div>

            {/* Vault Selection */}
            <VaultCards 
              selectedVault={selectedVault}
              onVaultSelect={setSelectedVault}
              vaultData={null}
            />

            {/* Info Section */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-8 mt-12">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">How It Works</h3>
                <p className="text-gray-400 leading-relaxed">
                  SNP automatically allocates your STX across the most profitable DeFi strategies on Stacks. 
                  Our smart contracts continuously monitor yields across 12+ protocols and rebalance your position 
                  to maximize returns while managing risk. All strategies are non-custodial – you maintain full 
                  control of your funds.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-400 mb-2">8%</div>
                    <div className="text-sm text-gray-400">Performance Fee</div>
                    <div className="text-xs text-gray-500 mt-1">Only on profits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">24h</div>
                    <div className="text-sm text-gray-400">Rebalancing</div>
                    <div className="text-xs text-gray-500 mt-1">Automated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
                    <div className="text-sm text-gray-400">Non-Custodial</div>
                    <div className="text-xs text-gray-500 mt-1">You own your keys</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ConnectPrompt />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live on Stacks Testnet</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">Analytics</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <div className="text-xs text-gray-500">
              © 2025 SNP Protocol. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
