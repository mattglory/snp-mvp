import numbro from 'numbro';

/**
 * Format currency with K/M/B abbreviations
 * @param value - Number or string to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like $1.2M
 */
export const formatCurrency = (value: number | string, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '$0.00';
  
  // Billion+
  if (num >= 1_000_000_000) {
    return numbro(num).format({ 
      average: true, 
      mantissa: decimals,
      optionalMantissa: true,
      totalLength: 4 
    }).replace(/[kmb]/, (match) => match.toUpperCase()).replace(/(\d)([KMB])/, '$1 $2');
  }
  
  // Million+
  if (num >= 1_000_000) {
    return numbro(num).format({ 
      average: true, 
      mantissa: decimals,
      optionalMantissa: true 
    }).replace(/[kmb]/, (match) => match.toUpperCase()).replace(/(\d)([KMB])/, '$1 $2');
  }
  
  // Thousand+
  if (num >= 1_000) {
    return numbro(num).format({ 
      average: true, 
      mantissa: decimals,
      optionalMantissa: true 
    }).replace(/[kmb]/, (match) => match.toUpperCase()).replace(/(\d)([KMB])/, '$1 $2');
  }
  
  // Regular numbers
  return numbro(num).formatCurrency({
    mantissa: decimals,
    thousandSeparated: true,
    currencySymbol: '$'
  });
};

/**
 * Format APY percentage
 * @param apy - APY value
 * @returns Formatted string like 14.25%
 */
export const formatAPY = (apy: number): string => {
  if (isNaN(apy)) return '0.00%';
  if (apy >= 1000) return `${numbro(apy / 100).format({ mantissa: 0 })}x`;
  return `${numbro(apy).format({ mantissa: 2 })}%`;
};

/**
 * Format percent change with sign
 * @param change - Change percentage
 * @returns Formatted string like +1.23%
 */
export const formatPercentChange = (change: number): string => {
  if (isNaN(change)) return '+0.00%';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${numbro(change).format({ mantissa: 2 })}%`;
};

/**
 * Format token amount with separators
 * @param amount - Token amount
 * @param decimals - Decimal places (default: 6)
 * @returns Formatted string like 1,234.567890
 */
export const formatTokenAmount = (amount: number, decimals: number = 6): string => {
  if (isNaN(amount)) return '0';
  return numbro(amount).format({
    thousandSeparated: true,
    mantissa: decimals,
    trimMantissa: true
  });
};

/**
 * Shorten address for display
 * @param address - Full address
 * @param chars - Number of chars to show on each side
 * @returns Shortened address like ST2H68...BEA
 */
export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};
