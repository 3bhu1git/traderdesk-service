import { getApiBaseUrl } from '../lib/getApiBaseUrl';

export interface MarketOverview {
  indices: IndexData[];
  marketStatus: {
    isOpen: boolean;
    status: string;
    nextOpen?: string;
  };
  lastUpdated: string;
}

export interface IndexData {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface SectorPerformance {
  sectors: SectorData[];
  lastUpdated: string;
}

export interface SectorData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface FIIDIIActivity {
  data: DailyActivity[];
  summary: {
    fiiNetFlow: number;
    diiNetFlow: number;
  };
  lastUpdated: string;
}

export interface DailyActivity {
  date: string;
  fii: {
    buy: number;
    sell: number;
    net: number;
  };
  dii: {
    buy: number;
    sell: number;
    net: number;
  };
}

export interface TopMovers {
  gainers: StockData[];
  losers: StockData[];
  lastUpdated: string;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high?: number;
  low?: number;
}

export interface InstitutionalActivity {
  insights: InstitutionalInsight[];
  lastUpdated: string;
}

export interface InstitutionalInsight {
  type: string;
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  amount?: string;
  sectors?: string[];
  timeframe: string;
}

class MarketIntelligenceService {
  private static instance: MarketIntelligenceService;
  private apiBaseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.apiBaseUrl = getApiBaseUrl();
  }

  public static getInstance(): MarketIntelligenceService {
    if (!MarketIntelligenceService.instance) {
      MarketIntelligenceService.instance = new MarketIntelligenceService();
    }
    return MarketIntelligenceService.instance;
  }

  private getCachedData<T>(key: string): T | null {
    const cachedItem = this.cache.get(key);
    if (cachedItem && (Date.now() - cachedItem.timestamp) < this.cacheExpiry) {
      return cachedItem.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchData<T>(endpoint: string, cacheKey: string): Promise<T> {
    // Check cache first
    const cachedData = this.getCachedData<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/market-intelligence${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: T = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching market intelligence data from ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get market overview including major indices
   */
  async getMarketOverview(): Promise<MarketOverview> {
    return this.fetchData<MarketOverview>('/overview', 'market_overview');
  }

  /**
   * Get sector performance data
   */
  async getSectorPerformance(): Promise<SectorPerformance> {
    return this.fetchData<SectorPerformance>('/sectors', 'sector_performance');
  }

  /**
   * Get FII/DII activity data
   */
  async getFIIDIIActivity(): Promise<FIIDIIActivity> {
    return this.fetchData<FIIDIIActivity>('/fii-dii', 'fii_dii_activity');
  }

  /**
   * Get top gainers and losers
   */
  async getTopMovers(limit: number = 5): Promise<TopMovers> {
    return this.fetchData<TopMovers>(`/movers?limit=${limit}`, `top_movers_${limit}`);
  }

  /**
   * Get institutional activity insights
   */
  async getInstitutionalActivity(): Promise<InstitutionalActivity> {
    return this.fetchData<InstitutionalActivity>('/institutional', 'institutional_activity');
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Refresh all market intelligence data
   */
  async refreshAllData(): Promise<{
    overview: MarketOverview;
    sectors: SectorPerformance;
    fiiDii: FIIDIIActivity;
    movers: TopMovers;
    institutional: InstitutionalActivity;
  }> {
    // Clear cache to force fresh data
    this.clearCache();

    // Fetch all data in parallel
    const [overview, sectors, fiiDii, movers, institutional] = await Promise.all([
      this.getMarketOverview(),
      this.getSectorPerformance(),
      this.getFIIDIIActivity(),
      this.getTopMovers(),
      this.getInstitutionalActivity(),
    ]);

    return {
      overview,
      sectors,
      fiiDii,
      movers,
      institutional,
    };
  }
}

export default MarketIntelligenceService;
