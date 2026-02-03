// Configuration for SNP Frontend
export const CONFIG = {
  // Network Configuration
  network: {
    mainnet: {
      url: 'https://api.mainnet.hiro.so',
      chainId: 1,
    },
    testnet: {
      url: 'https://api.testnet.hiro.so',
      chainId: 2147483648,
    },
  },

  // Contract Addresses (Testnet)
  contracts: {
    // Three Vault Options
    vaults: {
      balanced: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.vault-stx-v2',
      conservative: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.vault-conservative',
      growth: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.vault-growth',
    },
    strategyManager: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-manager-v2',
    
    // Strategy Contracts
    strategies: {
      sbtc: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-sbtc-v1',
      stackingDao: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-stackingdao-v1',
      granite: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-granite-v1',
      stablePool: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-stable-pool',
      alex: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-alex-stx-usda',
      arkadiko: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-arkadiko-vault',
      bitflow: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-bitflow-v1',
      hermetica: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-hermetica-v1',
      stackswap: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-stackswap-v1',
      velar: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-velar-farm',
      zest: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-zest-v1',
      stxStacking: 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA.strategy-stx-stacking',
    },
  },

  // Strategy Metadata
  strategyMetadata: {
    sbtc: {
      name: 'sBTC Strategy',
      description: 'Trust-minimized Bitcoin yield through sBTC',
      targetAPY: 18.5,
      riskLevel: 'medium' as const,
      category: 'Bitcoin',
    },
    stackingDao: {
      name: 'StackingDAO',
      description: 'Liquid stacking with auto-compounding',
      targetAPY: 14.2,
      riskLevel: 'low' as const,
      category: 'Stacking',
    },
    granite: {
      name: 'Granite Lending',
      description: 'Advanced lending with isolated collateral',
      targetAPY: 16.8,
      riskLevel: 'low' as const,
      category: 'Lending',
    },
    stablePool: {
      name: 'Stable Pool',
      description: 'Stablecoin yield farming',
      targetAPY: 12.0,
      riskLevel: 'low' as const,
      category: 'Stablecoins',
    },
    alex: {
      name: 'ALEX DEX',
      description: 'AMM liquidity provision',
      targetAPY: 6.5,
      riskLevel: 'medium' as const,
      category: 'DEX',
    },
    arkadiko: {
      name: 'Arkadiko Vault',
      description: 'Stablecoin vault yields',
      targetAPY: 8.0,
      riskLevel: 'low' as const,
      category: 'Vaults',
    },
    bitflow: {
      name: 'Bitflow',
      description: 'Liquidity provision with high yields',
      targetAPY: 9.2,
      riskLevel: 'medium' as const,
      category: 'DEX',
    },
    hermetica: {
      name: 'Hermetica',
      description: 'Leveraged yield farming',
      targetAPY: 10.8,
      riskLevel: 'high' as const,
      category: 'Leveraged',
    },
    stackswap: {
      name: 'StackSwap',
      description: 'DEX liquidity mining',
      targetAPY: 7.5,
      riskLevel: 'medium' as const,
      category: 'DEX',
    },
    velar: {
      name: 'Velar',
      description: 'Yield farming with VELAR rewards',
      targetAPY: 12.0,
      riskLevel: 'medium' as const,
      category: 'Farming',
    },
    zest: {
      name: 'Zest',
      description: 'Bitcoin lending protocol',
      targetAPY: 15.0,
      riskLevel: 'low' as const,
      category: 'Lending',
    },
    stxStacking: {
      name: 'STX Stacking',
      description: 'Native Proof of Transfer stacking',
      targetAPY: 6.0,
      riskLevel: 'low' as const,
      category: 'Stacking',
    },
  },

  // Vault Metadata - 3 Risk Profiles
  vaultMetadata: {
    balanced: {
      id: 'balanced',
      name: 'Balanced Vault',
      symbol: 'snSTX',
      description: 'Optimized balance of risk and reward',
      targetAPY: '12-16%',
      riskScore: 3,
      riskLevel: 'medium' as const,
      strategyFocus: 'Diversified yield optimization',
      performanceFee: 0,
      icon: '⚖️',
      gradient: 'from-bitcoin-orange to-yellow-600',
    },
    conservative: {
      id: 'conservative',
      name: 'Conservative Vault',
      symbol: 'snSTX-CONS',
      description: 'Low-risk strategies for capital preservation',
      targetAPY: '8-10%',
      riskScore: 2,
      riskLevel: 'low' as const,
      strategyFocus: 'Stable yields, capital preservation',
      performanceFee: 0,
      icon: '🛡️',
      gradient: 'from-success to-emerald-600',
    },
    growth: {
      id: 'growth',
      name: 'Growth Vault',
      symbol: 'snSTX-GRTH',
      description: 'High-yield strategies for maximum returns',
      targetAPY: '18-25%',
      riskScore: 4,
      riskLevel: 'high' as const,
      strategyFocus: 'Maximum yields, higher risk tolerance',
      performanceFee: 0,
      icon: '🚀',
      gradient: 'from-purple-500 to-pink-600',
    },
  },

  // UI Configuration
  ui: {
    updateInterval: 5000, // 5 seconds (Nakamoto speed!)
    defaultSlippage: 0.5, // 0.5%
    maxSlippage: 5.0, // 5%
    minDeposit: 1000000, // 1 STX in microSTX
    decimals: 6, // STX decimals
  },

  // Feature Flags
  features: {
    enableWithdrawals: true,
    enableHarvest: true,
    enableAutoCompound: true,
    showHistoricalCharts: true,
    showRiskMetrics: true,
  },
};

export default CONFIG;
