import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Wallet, BarChart3, Settings, FileText, ExternalLink } from 'lucide-react';
import React from 'react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '#' },
    { icon: Wallet, label: 'Vaults', href: '#vaults' },
    { icon: BarChart3, label: 'Analytics', href: '#analytics' },
    { icon: FileText, label: 'Docs', href: 'https://docs.snp.finance', external: true },
    { icon: Settings, label: 'Settings', href: '#settings' },
  ];

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <React.Fragment key="mobile-nav">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] bg-gray-900 border-l border-gray-800 z-50 lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">₿</span>
                </div>
                <span className="text-lg font-bold text-white">SNP</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.external && (
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Network Status */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Stacks Testnet</span>
                </div>
                <span className="text-xs text-gray-500">Connected</span>
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      ) : null}
    </AnimatePresence>
  );
}
