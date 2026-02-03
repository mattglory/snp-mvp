import { Wallet, Shield, Zap, TrendingUp } from 'lucide-react';

export function ConnectPrompt() {
  return (
    <div className="max-w-4xl mx-auto py-20">
      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl p-12 text-center">
        <div className="inline-block p-5 bg-orange-500/10 rounded-2xl mb-8">
          <Wallet className="w-16 h-16 text-orange-500" />
        </div>

        <h2 className="text-4xl font-bold text-white mb-4">
          Start Earning on Bitcoin L2
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          One deposit. 12 protocols. Automated yield optimization.<br />
          Built on Bitcoin's security with Stacks.
        </p>

        <button className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-orange-500/50">
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet to Start</span>
        </button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-700">
          <div className="space-y-3">
            <div className="inline-block p-3 bg-blue-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Bitcoin Secured</h3>
            <p className="text-sm text-gray-400">
              Leverage Bitcoin's security through Stacks Layer 2
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-block p-3 bg-green-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Auto-Optimized</h3>
            <p className="text-sm text-gray-400">
              Smart allocation across 12 DeFi protocols automatically
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-block p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">High Yields</h3>
            <p className="text-sm text-gray-400">
              8-25% APY across Conservative, Balanced & Growth vaults
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Production Ready</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>100% Test Coverage</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>17 Smart Contracts</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Multi-Sig Governance</span>
        </div>
      </div>
    </div>
  );
}
