// Utility functions for SNP Frontend

import Big from 'big.js';

// Format microSTX to STX
export function formatSTX(microSTX: number | string, decimals: number = 2): string {
  const stx = new Big(microSTX).div(1000000);
  return stx.toFixed(decimals);
}

// Format STX to microSTX
export function toMicroSTX(stx: number | string): number {
  return new Big(stx).times(1000000).toNumber();
}

// Format APY percentage
export function formatAPY(apy: number, decimals: number = 2): string {
  return `${apy.toFixed(decimals)}%`;
}

// Format large numbers with K, M, B suffix
export function formatCompact(num: number): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

// Format USD value
export function formatUSD(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Format timestamp to readable date
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format timestamp to relative time (e.g., "2 hours ago")
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(timestamp);
}

// Truncate address for display
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Calculate share price
export function calculateSharePrice(totalAssets: number, totalShares: number): number {
  if (totalShares === 0) return 1;
  return totalAssets / totalShares;
}

// Calculate shares from amount
export function calculateShares(amount: number, sharePrice: number): number {
  return amount / sharePrice;
}

// Calculate amount from shares
export function calculateAmount(shares: number, sharePrice: number): number {
  return shares * sharePrice;
}

// Validate STX amount
export function isValidAmount(amount: string): boolean {
  try {
    const num = new Big(amount);
    return num.gt(0);
  } catch {
    return false;
  }
}

// Calculate slippage
export function calculateSlippage(expected: number, actual: number): number {
  return ((expected - actual) / expected) * 100;
}

// Get risk color class
export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return 'text-success';
    case 'medium':
      return 'text-warning';
    case 'high':
      return 'text-error';
    default:
      return 'text-gray-400';
  }
}

// Get risk label
export function getRiskLabel(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return '🟢 Low Risk';
    case 'medium':
      return '🟡 Medium Risk';
    case 'high':
      return '🔴 High Risk';
    default:
      return 'Unknown';
  }
}

// Calculate portfolio return
export function calculateReturn(deposited: number, current: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = current - deposited;
  const percentage = (absolute / deposited) * 100;
  return { absolute, percentage };
}

// Debounce function for input handlers
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
