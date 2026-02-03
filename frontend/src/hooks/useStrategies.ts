import { useQuery } from '@tanstack/react-query';

export interface Strategy {
  id: string;
  name: string;
  protocol: string;
  category: 'lending' | 'staking' | 'dex' | 'vault';
  apy: number;
  tvl: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  allocation: {
    conservative: number;
    balanced: number;
    growth: number;
  };
}

const MOCK_STRATEGIES: Strategy[] = [
  {
    id: 'alex-amm',
    name: 'ALEX AMM',
    protocol: 'ALEX',
    category: 'dex',
    apy: 6.5,
    tvl: 540000,
    risk: 'MEDIUM',
    allocation: { conservative: 0, balanced: 30, growth: 30 }
  },
  {
    id: 'zest-lending',
    name: 'Zest Lending',
    protocol: 'Zest',
    category: 'lending',
    apy: 15.0,
    tvl: 216000,
    risk: 'LOW',
    allocation: { conservative: 0, balanced: 12, growth: 12 }
  },
  {
    id: 'sbtc-holdings',
    name: 'sBTC Holdings',
    protocol: 'sBTC',
    category: 'vault',
    apy: 18.5,
    tvl: 180000,
    risk: 'MEDIUM',
    allocation: { conservative: 0, balanced: 10, growth: 10 }
  },
  {
    id: 'stackswap-dex',
    name: 'StackSwap DEX',
    protocol: 'StackSwap',
    category: 'dex',
    apy: 7.5,
    tvl: 180000,
    risk: 'MEDIUM',
    allocation: { conservative: 0, balanced: 10, growth: 10 }
  },
  {
    id: 'granite-lending',
    name: 'Granite Lending',
    protocol: 'Granite',
    category: 'lending',
    apy: 16.8,
    tvl: 180000,
    risk: 'LOW',
    allocation: { conservative: 0, balanced: 10, growth: 10 }
  },
  {
    id: 'bitflow-dex',
    name: 'Bitflow DEX',
    protocol: 'Bitflow',
    category: 'dex',
    apy: 9.2,
    tvl: 144000,
    risk: 'MEDIUM',
    allocation: { conservative: 0, balanced: 8, growth: 8 }
  },
  {
    id: 'arkadiko-vault',
    name: 'Arkadiko Vault',
    protocol: 'Arkadiko',
    category: 'vault',
    apy: 8.0,
    tvl: 144000,
    risk: 'LOW',
    allocation: { conservative: 0, balanced: 8, growth: 8 }
  },
  {
    id: 'hermetica-vault',
    name: 'Hermetica Vault',
    protocol: 'Hermetica',
    category: 'vault',
    apy: 10.8,
    tvl: 144000,
    risk: 'HIGH',
    allocation: { conservative: 0, balanced: 8, growth: 8 }
  },
  {
    id: 'stackingdao',
    name: 'StackingDAO',
    protocol: 'StackingDAO',
    category: 'staking',
    apy: 14.2,
    tvl: 126000,
    risk: 'LOW',
    allocation: { conservative: 0, balanced: 7, growth: 7 }
  },
  {
    id: 'stx-stacking',
    name: 'STX Stacking',
    protocol: 'Native',
    category: 'staking',
    apy: 6.0,
    tvl: 126000,
    risk: 'LOW',
    allocation: { conservative: 0, balanced: 7, growth: 7 }
  },
  {
    id: 'velar-farm',
    name: 'Velar Farm',
    protocol: 'Velar',
    category: 'dex',
    apy: 12.0,
    tvl: 126000,
    risk: 'MEDIUM',
    allocation: { conservative: 0, balanced: 7, growth: 7 }
  },
  {
    id: 'stable-pool',
    name: 'Stable Pool',
    protocol: 'Multiple',
    category: 'lending',
    apy: 12.0,
    tvl: 90000,
    risk: 'LOW',
    allocation: { conservative: 0, balanced: 5, growth: 5 }
  },
];

export function useStrategies() {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: async (): Promise<Strategy[]> => {
      // TODO: Replace with actual API call
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_STRATEGIES;
    },
    staleTime: 60_000, // Strategies don't change frequently
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
