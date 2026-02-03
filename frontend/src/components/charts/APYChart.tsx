import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';
import { useVaultHistory } from '../../hooks/useVaultHistory';
import { Skeleton } from '../ui/Skeleton';

interface APYChartProps {
  vaultId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
}

export function APYChart({ vaultId, timeRange }: APYChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  
  const { data: historyData, isLoading } = useVaultHistory(vaultId, timeRange);

  useEffect(() => {
    if (!chartContainerRef.current || !historyData || historyData.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
    });

    chartRef.current = chart;

    // Add area series (v5 API)
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#F7931A',
      topColor: 'rgba(247, 147, 26, 0.4)',
      bottomColor: 'rgba(247, 147, 26, 0.0)',
      lineWidth: 2,
    });

    seriesRef.current = areaSeries;

    // Set data
    const formattedData = historyData.map(point => ({
      time: Math.floor(point.timestamp / 1000) as any,
      value: point.apy,
    }));
    
    areaSeries.setData(formattedData);
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historyData]);

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <Skeleton className="w-full h-[300px]" />
      </div>
    );
  }

  const averageAPY = historyData && historyData.length > 0
    ? historyData.reduce((sum, p) => sum + p.apy, 0) / historyData.length
    : 0;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">APY Performance</h3>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Average:</span>
          <span className="text-orange-400 font-bold">
            {averageAPY.toFixed(2)}%
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
