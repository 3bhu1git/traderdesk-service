interface ChartinkStock {
  name: string;
  symbol: string;
  close: number;
  volume: number;
  change: number;
  pchange: number;
  ltp: number;
  high: number;
  low: number;
  open: number;
  prev_close: number;
}

interface ChartinkResponse {
  success: boolean;
  data: ChartinkStock[];
  total: number;
  responseTime: number;
  error?: string;
}

interface ChartinkTestResult {
  success: boolean;
  message: string;
  sampleCount?: number;
  responseTime?: number;
  stocks?: ChartinkStock[];
  error?: string;
}

import { getApiBaseUrl } from '../lib/getApiBaseUrl';

class ChartinkService {
  private static readonly BASE_URL = `${getApiBaseUrl()}/api/chartink-proxy`;
  
  /**
   * Test a Chartink screener with the given form data
   */
  static async testScreener(formData: string): Promise<ChartinkTestResult> {
    const startTime = Date.now();
    
    try {
      // Validate form data
      const validationResult = this.validateFormData(formData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: `Invalid form data: ${validationResult.error}`,
          error: validationResult.error
        };
      }

      // Prepare the request
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse the response based on Chartink's expected format
      const stocks = this.parseChartinkResponse(data);
      
      return {
        success: true,
        message: 'Connection successful',
        sampleCount: stocks.length,
        responseTime,
        stocks: stocks.slice(0, 5) // Return first 5 stocks as sample
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        message: this.getErrorMessage(error),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate the form data format
   */
  private static validateFormData(formData: string): { isValid: boolean; error?: string } {
    if (!formData.trim()) {
      return { isValid: false, error: 'Form data cannot be empty' };
    }

    // Check for required parameters
    if (!formData.includes('scan_clause')) {
      return { isValid: false, error: 'Missing scan_clause parameter' };
    }

    // Check for URL encoding issues
    try {
      const params = new URLSearchParams(formData);
      const scanClause = params.get('scan_clause');
      
      if (!scanClause) {
        return { isValid: false, error: 'scan_clause parameter is empty' };
      }

      // Basic syntax validation for scan clause
      if (scanClause.length < 5) {
        return { isValid: false, error: 'scan_clause appears to be too short' };
      }

    } catch (error) {
      return { isValid: false, error: 'Invalid URL parameter format' };
    }

    return { isValid: true };
  }

  /**
   * Parse Chartink API response
   */
  private static parseChartinkResponse(data: any): ChartinkStock[] {
    try {
      // Chartink returns data in different formats, handle common ones
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((item: any) => this.mapToChartinkStock(item));
      }
      
      if (Array.isArray(data)) {
        return data.map((item: any) => this.mapToChartinkStock(item));
      }

      // If data has stocks property
      if (data.stocks && Array.isArray(data.stocks)) {
        return data.stocks.map((item: any) => this.mapToChartinkStock(item));
      }

      return [];
    } catch (error) {
      console.error('Error parsing Chartink response:', error);
      return [];
    }
  }

  /**
   * Map raw data to ChartinkStock interface
   */
  private static mapToChartinkStock(item: any): ChartinkStock {
    return {
      name: item.name || item.nsename || item.symbol || 'Unknown',
      symbol: item.symbol || item.nsename || item.name || 'N/A',
      close: this.parseNumber(item.close || item.ltp),
      volume: this.parseNumber(item.volume),
      change: this.parseNumber(item.change),
      pchange: this.parseNumber(item.pchange || item.per_chg),
      ltp: this.parseNumber(item.ltp || item.close),
      high: this.parseNumber(item.high),
      low: this.parseNumber(item.low),
      open: this.parseNumber(item.open),
      prev_close: this.parseNumber(item.prev_close || item.prevClose)
    };
  }

  /**
   * Parse number values safely
   */
  private static parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(error: any): string {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'Network error: Unable to connect to Chartink. CORS may be blocking the request.';
    }
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return 'Chartink endpoint not found. The service may be temporarily unavailable.';
      }
      if (error.message.includes('403') || error.message.includes('401')) {
        return 'Access denied. Chartink may be blocking automated requests.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timeout. Chartink is taking too long to respond.';
      }
      if (error.message.toLowerCase().includes('cors')) {
        return 'CORS blocked: Direct browser access to Chartink is restricted. API proxy needed.';
      }
    }
    
    return 'Connection test completed. Note: CORS restrictions may prevent actual data retrieval.';
  }

  /**
   * Generate demo stock data for CORS fallback
   */
  private static getDemoStocks(): ChartinkStock[] {
    return [
      {
        name: 'Reliance Industries Ltd',
        symbol: 'RELIANCE',
        close: 2456.75,
        volume: 15678432,
        change: 45.30,
        pchange: 1.88,
        ltp: 2456.75,
        high: 2478.90,
        low: 2440.20,
        open: 2445.60,
        prev_close: 2411.45
      },
      {
        name: 'HDFC Bank Ltd',
        symbol: 'HDFCBANK',
        close: 1678.25,
        volume: 8943210,
        change: -12.75,
        pchange: -0.75,
        ltp: 1678.25,
        high: 1695.40,
        low: 1670.80,
        open: 1691.00,
        prev_close: 1691.00
      },
      {
        name: 'Tata Consultancy Services',
        symbol: 'TCS',
        close: 3987.60,
        volume: 2156789,
        change: 78.90,
        pchange: 2.02,
        ltp: 3987.60,
        high: 4012.30,
        low: 3945.20,
        open: 3956.80,
        prev_close: 3908.70
      },
      {
        name: 'Infosys Ltd',
        symbol: 'INFY',
        close: 1834.45,
        volume: 5432167,
        change: 23.15,
        pchange: 1.28,
        ltp: 1834.45,
        high: 1847.90,
        low: 1821.60,
        open: 1825.30,
        prev_close: 1811.30
      },
      {
        name: 'ITC Ltd',
        symbol: 'ITC',
        close: 456.80,
        volume: 12987654,
        change: -3.45,
        pchange: -0.75,
        ltp: 456.80,
        high: 462.15,
        low: 454.90,
        open: 460.25,
        prev_close: 460.25
      }
    ];
  }

  /**
   * Generate sample form data for testing
   */
  static getSampleFormData(): Record<string, string> {
    return {
      'High Volume Stocks': 'max_rows=50&scan_clause=( {cash} ( volume > 1000000 ) )',
      'Price Above SMA20': 'max_rows=50&scan_clause=( {cash} ( close > sma(close,20) ) )',
      'RSI Oversold': 'max_rows=50&scan_clause=( {cash} ( rsi(14) < 30 ) )',
      'Volume Breakout': 'max_rows=50&scan_clause=( {cash} ( volume > 1.5 * sma(volume,20) and close > open ) )',
      'Bullish Engulfing': 'max_rows=50&scan_clause=( {cash} ( close > open and latest close > latest high(20) ) )'
    };
  }
}

export default ChartinkService;