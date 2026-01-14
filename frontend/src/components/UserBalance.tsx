import { useState, useEffect, useRef } from 'react';
import { formatSTX } from '../utils/formatting';

interface UserBalanceProps {
  address: string | null;
  isConnected: boolean;
}

export function UserBalance({ address, isConnected }: UserBalanceProps) {
  const [stxBalance, setStxBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!address || !isConnected) {
      setStxBalance(null);
      return;
    }

    const fetchBalance = async () => {
      // Prevent multiple simultaneous fetches
      if (fetchingRef.current) return;

      fetchingRef.current = true;
      setLoading(true);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Failed to fetch balance');
        }

        const data = await response.json();
        setStxBalance(parseInt(data.stx.balance));
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch balance:', error);
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    // Initial fetch
    fetchBalance();

    // Refresh every 30s
    const interval = setInterval(fetchBalance, 30000);

    return () => {
      clearInterval(interval);
      fetchingRef.current = false;
    };
  }, [address, isConnected]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="card animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-300">Your Balance</h3>
        {loading && (
          <div className="w-4 h-4 border-2 border-bitcoin-orange border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      <div className="space-y-4">
        {/* STX Balance */}
        <div className="p-4 bg-dark-bg rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Available STX</p>
              <p className="text-2xl font-bold text-white">
                {stxBalance !== null ? formatSTX(stxBalance, 2) : '---'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-bitcoin-orange/20 flex items-center justify-center">
              <span className="text-2xl">₿</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-dark-bg rounded-xl">
          <p className="text-sm text-gray-400 mb-2">Quick Actions</p>
          <div className="flex gap-2">
            <button className="flex-1 py-2 px-3 bg-bitcoin-orange/10 hover:bg-bitcoin-orange/20 text-bitcoin-orange rounded-lg text-xs font-semibold transition-all">
              Faucet
            </button>
            <button className="flex-1 py-2 px-3 bg-dark-surface hover:bg-dark-surface-hover text-gray-300 rounded-lg text-xs font-semibold transition-all">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {address && (
        <div className="mt-4 pt-4 border-t border-dark-border">
          <a
            href={`https://explorer.hiro.so/address/${address}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-bitcoin-orange hover:text-bitcoin-orange-light transition-colors flex items-center gap-2"
          >
            <span>View on Explorer</span>
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
