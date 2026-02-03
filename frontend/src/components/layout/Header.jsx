import { useState } from 'react';
import { Wallet, ExternalLink, Menu } from 'lucide-react';
import { showConnect } from '@stacks/connect';
import { MobileNav } from './MobileNav';

export function Header({ userData, userSession, onUserDataChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'SNP - Stacks Nexus Protocol',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData();
        onUserDataChange(data);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut('/');
    onUserDataChange(null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-lg opacity-50"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₿</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SNP</h1>
                <p className="text-xs text-gray-400">Bitcoin's Yield Aggregator</p>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white font-medium hover:text-orange-400 transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Vaults
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Analytics
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1">
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Network Indicator - Desktop */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">Testnet</span>
              </div>

              {/* Wallet Button */}
              {!userData ? (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-400 mb-0.5">Connected</div>
                    <div className="text-sm text-white font-mono">
                      {userData.profile.stxAddress.testnet.slice(0, 6)}...
                      {userData.profile.stxAddress.testnet.slice(-4)}
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="hidden sm:block px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
