import { useState, useEffect, useCallback, useRef } from 'react';
import { DataService } from '../services/DataService';

// Generic data fetching hook with loading, error, and refresh functionality
export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  initialData: T,
  refreshInterval?: number
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFunction();
      if (isMounted.current) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFunction]);

  // Initial fetch with debounce to prevent multiple simultaneous requests
  useEffect(() => {
    isMounted.current = true;
    
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      window.clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set a small timeout to debounce multiple rapid calls
    fetchTimeoutRef.current = window.setTimeout(() => {
      fetchData();
    }, 50);
    
    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchFunction, fetchData]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (!refreshInterval) return;
    
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      window.clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = window.setInterval(() => {
      if (isMounted.current && document.visibilityState !== 'hidden') {
        fetchData();
      }
    }, refreshInterval);
    
    // Add visibility change listener to pause/resume fetching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && refreshIntervalRef.current === null) {
        // Resume interval when tab becomes visible
        refreshIntervalRef.current = window.setInterval(() => {
          if (isMounted.current) {
            fetchData();
          }
        }, refreshInterval);
      } else if (document.visibilityState === 'hidden' && refreshIntervalRef.current !== null) {
        // Pause interval when tab is hidden
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval, fetchData]);

  // Manual refresh function
  const refreshData = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, lastUpdated, refreshData };
}

// Specialized hooks for common data types
export function useMarketData(refreshInterval?: number) {
  const dataService = DataService.getInstance();
  return useDataFetching(
    () => dataService.getMarketData(),
    {
      nifty: { value: 0, change: 0, changePercent: 0 },
      sensex: { value: 0, change: 0, changePercent: 0 },
      bankNifty: { value: 0, change: 0, changePercent: 0 },
      vix: { value: 0, change: 0, changePercent: 0 },
      advanceDecline: { advances: 0, declines: 0, unchanged: 0 }
    },
    refreshInterval
  );
}

export function useSectorData(refreshInterval?: number) {
  const dataService = DataService.getInstance();
  return useDataFetching(
    () => dataService.getSectorData(),
    [],
    refreshInterval
  );
}

export function useFIIDIIData(days: number = 10, refreshInterval?: number) {
  const dataService = DataService.getInstance();
  return useDataFetching(
    () => dataService.getFIIDIIData(days),
    [],
    refreshInterval
  );
}

export function useStockData(symbol: string, refreshInterval?: number) {
  const dataService = DataService.getInstance();
  return useDataFetching(
    () => dataService.getStockData(symbol),
    null,
    refreshInterval
  );
}

export function useTopGainers(limit: number = 5, refreshInterval?: number) {
  const dataService = DataService.getInstance();
  return useDataFetching(
    () => dataService.getTopGainers(limit),
    [],
    refreshInterval
  );
}

export function useTopLosers(limit: number = 5, refreshInterval?: number) {
  const dataService = DataService.getInstance();
  return useDataFetching(
    () => dataService.getTopLosers(limit),
    [],
    refreshInterval
  );
}

export function useOptionChainData(symbol: string, expiryDate?: string, refreshInterval?: number) {
  const dataService = DataService.getInstance();
  return useDataFetching(
    () => dataService.getOptionChainData(symbol, expiryDate),
    [],
    refreshInterval
  );
}