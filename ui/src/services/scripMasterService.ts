import axios from 'axios';

interface ScripMaster {
  [key: string]: {
    symbol: string;
    name: string;
    exchange: string;
    token: string;
    lotSize?: number;
    tickSize?: number;
    instrumentType?: string;
    segment?: string;
  };
}

export class ScripMasterService {
  private static instance: ScripMasterService;
  private scripMaster: ScripMaster = {};
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private lastUpdated: Date | null = null;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  public static getInstance(): ScripMasterService {
    if (!ScripMasterService.instance) {
      ScripMasterService.instance = new ScripMasterService();
    }
    return ScripMasterService.instance;
  }
  
  public async loadScripMaster(): Promise<boolean> {
    if (this.isLoading) {
      console.log('Scrip master is already being loaded');
      return false;
    }
    
    if (this.isLoaded && this.lastUpdated && (new Date().getTime() - this.lastUpdated.getTime() < 24 * 60 * 60 * 1000)) {
      console.log('Using cached scrip master data');
      return true;
    }
    
    try {
      this.isLoading = true;
      console.log('Loading scrip master file...');
      
      // First, try to load from localStorage
      const cachedData = localStorage.getItem('scripMaster');
      const cachedTimestamp = localStorage.getItem('scripMasterTimestamp');
      
      if (cachedData && cachedTimestamp) {
        const timestamp = new Date(cachedTimestamp);
        // Use cached data if it's less than 24 hours old
        if (new Date().getTime() - timestamp.getTime() < 24 * 60 * 60 * 1000) {
          this.scripMaster = JSON.parse(cachedData);
          this.isLoaded = true;
          this.lastUpdated = timestamp;
          console.log('Loaded scrip master from cache');
          this.isLoading = false;
          return true;
        }
      }
      
      // If no valid cache, download from source
      const response = await axios.get('https://images.dhan.co/api-data/api-scrip-master-detailed.csv', {
        responseType: 'text'
      });
      
      if (response.status === 200) {
        const csvData = response.data;
        this.parseScripMasterCSV(csvData);
        
        // Cache the parsed data
        localStorage.setItem('scripMaster', JSON.stringify(this.scripMaster));
        localStorage.setItem('scripMasterTimestamp', new Date().toISOString());
        
        this.isLoaded = true;
        this.lastUpdated = new Date();
        console.log('Scrip master loaded successfully');
        return true;
      } else {
        throw new Error(`Failed to download scrip master: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading scrip master:', error);
      
      // If download fails but we have cached data (even if old), use it as fallback
      const cachedData = localStorage.getItem('scripMaster');
      if (cachedData) {
        this.scripMaster = JSON.parse(cachedData);
        this.isLoaded = true;
        this.lastUpdated = new Date(localStorage.getItem('scripMasterTimestamp') || '');
        console.log('Using cached scrip master as fallback');
        return true;
      }
      
      return false;
    } finally {
      this.isLoading = false;
    }
  }
  
  private parseScripMasterCSV(csvData: string): void {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    // Find the indices of the columns we need
    const symbolIndex = headers.indexOf('symbol');
    const nameIndex = headers.indexOf('name');
    const exchangeIndex = headers.indexOf('exchange');
    const tokenIndex = headers.indexOf('token');
    const lotSizeIndex = headers.indexOf('lotSize');
    const tickSizeIndex = headers.indexOf('tickSize');
    const instrumentTypeIndex = headers.indexOf('instrumentType');
    const segmentIndex = headers.indexOf('segment');
    
    // Parse each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      
      if (values.length < Math.max(symbolIndex, nameIndex, exchangeIndex, tokenIndex) + 1) {
        continue; // Skip invalid lines
      }
      
      const symbol = values[symbolIndex];
      const name = values[nameIndex];
      const exchange = values[exchangeIndex];
      const token = values[tokenIndex];
      
      if (!symbol || !exchange || !token) continue;
      
      this.scripMaster[symbol] = {
        symbol,
        name,
        exchange,
        token,
        lotSize: lotSizeIndex >= 0 ? parseInt(values[lotSizeIndex]) || 1 : 1,
        tickSize: tickSizeIndex >= 0 ? parseFloat(values[tickSizeIndex]) || 0.05 : 0.05,
        instrumentType: instrumentTypeIndex >= 0 ? values[instrumentTypeIndex] : undefined,
        segment: segmentIndex >= 0 ? values[segmentIndex] : undefined
      };
    }
    
    console.log(`Parsed ${Object.keys(this.scripMaster).length} symbols from scrip master`);
  }
  
  public getScripDetails(symbol: string): any {
    if (!this.isLoaded) {
      console.warn('Scrip master not loaded yet');
      return null;
    }
    
    return this.scripMaster[symbol] || null;
  }
  
  public searchScrips(query: string, limit: number = 10): any[] {
    if (!this.isLoaded || !query || query.length < 2) {
      return [];
    }
    
    const normalizedQuery = query.toUpperCase();
    const results = [];
    
    for (const key in this.scripMaster) {
      const scrip = this.scripMaster[key];
      
      if (
        scrip.symbol.includes(normalizedQuery) || 
        (scrip.name && scrip.name.toUpperCase().includes(normalizedQuery))
      ) {
        results.push(scrip);
        
        if (results.length >= limit) {
          break;
        }
      }
    }
    
    return results;
  }
  
  public getExchangeSymbols(exchange: string, limit: number = 100): any[] {
    if (!this.isLoaded) {
      return [];
    }
    
    const results = [];
    
    for (const key in this.scripMaster) {
      const scrip = this.scripMaster[key];
      
      if (scrip.exchange === exchange) {
        results.push(scrip);
        
        if (results.length >= limit) {
          break;
        }
      }
    }
    
    return results;
  }
  
  public getInstrumentsByType(type: string, limit: number = 100): any[] {
    if (!this.isLoaded) {
      return [];
    }
    
    const results = [];
    
    for (const key in this.scripMaster) {
      const scrip = this.scripMaster[key];
      
      if (scrip.instrumentType === type) {
        results.push(scrip);
        
        if (results.length >= limit) {
          break;
        }
      }
    }
    
    return results;
  }
}