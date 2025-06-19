import React, { useState, useEffect } from 'react';
import { DataService, MarketData } from '../../services/DataService';

interface MarketDataViewerProps {
  symbol: string;
}

const MarketDataViewer: React.FC<MarketDataViewerProps> = ({ symbol }) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataService = DataService.getInstance();
    let isSubscribed = true;

    const handleMarketData = (data: MarketData) => {
      if (isSubscribed) {
        setMarketData(data);
        setError(null);
      }
    };

    const subscribeToData = async () => {
      try {
        await dataService.subscribeToMarketData(symbol, handleMarketData);
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to subscribe to market data');
        }
      }
    };

    subscribeToData();

    return () => {
      isSubscribed = false;
      dataService.cleanup();
    };
  }, [symbol]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="p-4">
        <p>Loading market data...</p>
      </div>
    );
  }

  const priceChange = marketData.close - marketData.open;
  const priceChangePercent = (priceChange / marketData.open) * 100;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{symbol}</h2>
        <span className="text-sm text-gray-500">
          {new Date(marketData.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Current</p>
          <p className="text-lg font-semibold">{marketData.close.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Change</p>
          <p className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-lg">{marketData.open.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Volume</p>
          <p className="text-lg">{marketData.volume.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">High</p>
          <p className="text-lg">{marketData.high.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Low</p>
          <p className="text-lg">{marketData.low.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default MarketDataViewer; 