import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { MarketDataService } from '../services/marketDataService';

interface LightweightChartProps {
  symbol: string;
  data: CandlestickData[];
}

export const LightweightChart: React.FC<LightweightChartProps> = ({ symbol, data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const marketDataService = MarketDataService.getInstance();

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1B2631' },
          textColor: '#DDD',
        },
        grid: {
          vertLines: { color: '#2C3E50' },
          horzLines: { color: '#2C3E50' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
      });

      const candlestickSeries = (chart as any).addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      // Set initial data
      if (data && data.length > 0) {
        candlestickSeries.setData(data);
      }

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      // Set up polling for live data
      const pollInterval = setInterval(async () => {
        try {
          const now = new Date();
          const from = new Date(now.getTime() - 5 * 60 * 1000); // Last 5 minutes
          const liveData = await marketDataService.getHistoricalData(symbol, from, now);
          
          if (liveData && liveData.length > 0) {
            const transformedData = liveData.map(candle => ({
              time: new Date(candle.timestamp).getTime() / 1000,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
            }));
            
            candlestickSeries.update(transformedData[transformedData.length - 1]);
          }
        } catch (error) {
          console.error('Error fetching live data:', error);
        }
      }, 5000); // Poll every 5 seconds

      return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(pollInterval);
        chart.remove();
      };
    }
  }, [symbol, data]);

  return (
    <div className="relative w-full h-[500px]">
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="text-white">Connecting...</div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}; 