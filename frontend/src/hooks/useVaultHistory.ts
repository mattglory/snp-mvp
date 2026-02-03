import { useQuery } from '@tanstack/react-query';

export interface HistoricalDataPoint {
  timestamp: number;
  apy: number;
  tvl: number;
}

export function useVaultHistory(vaultId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
  return useQuery({
    queryKey: ['vaultHistory', vaultId, timeRange],
    queryFn: async (): Promise<HistoricalDataPoint[]> => {
      // TODO: Replace with actual API call to backend or indexer
      // For now, generating realistic mock data
      const now = Date.now();
      const pointsMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      const points = pointsMap[timeRange];
      const dayMs = 24 * 60 * 60 * 1000;
      
      const baseAPYMap: Record<string, number> = {
        'conservative': 8.5,
        'balanced': 14.2,
        'growth': 21.8,
      };
      
      const baseTVLMap: Record<string, number> = {
        'conservative': 500_000,
        'balanced': 1_800_000,
        'growth': 300_000,
      };
      
      const baseAPY = baseAPYMap[vaultId] || 14.2;
      const baseTVL = baseTVLMap[vaultId] || 1_800_000;
      
      return Array.from({ length: points }, (_, i) => {
        // Add some realistic variance
        const progress = i / points;
        const seasonality = Math.sin(progress * Math.PI * 2) * 2;
        const trend = progress * 1.5; // Slight upward trend
        const noise = (Math.random() - 0.5) * 3;
        
        return {
          timestamp: now - (points - i) * dayMs,
          apy: Math.max(0, baseAPY + seasonality + trend + noise),
          tvl: Math.max(0, baseTVL * (0.85 + Math.random() * 0.3)),
        };
      });
    },
    staleTime: 5 * 60 * 1000, // Historical data stale after 5 minutes
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
}
