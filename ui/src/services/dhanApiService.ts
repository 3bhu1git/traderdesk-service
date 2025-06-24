import axios from 'axios';
import { LocalStorageService } from '../lib/localStorage';

// Types for Dhan API
export interface DhanCredentials {
  customer: string;
  clientId: string;
  clientSecret: string;
}

export interface DhanAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface DhanHolding {
  symbol: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  pnlPercentage: number;
}

export interface DhanPosition {
  symbol: string;
  exchange: string;
  product: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  pnlPercentage: number;
}

export interface DhanOrder {
  orderId: string;
  symbol: string;
  exchange: string;
  transactionType: string;
  quantity: number;
  price: number;
  status: string;
  orderTimestamp: string;
}

export interface DhanOrderParams {
  symbol: string;
  exchange: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  productType: 'INTRADAY' | 'DELIVERY' | 'MARGIN';
  orderType: 'LIMIT' | 'MARKET' | 'SL' | 'SLM';
  validity: 'DAY' | 'IOC';
  disclosedQuantity?: number;
  triggerPrice?: number;
}

export interface DhanFutureOrderParams extends DhanOrderParams {
  expiry: string;
}

export class DhanApiService {
  private static readonly DHAN_API_BASE_URL = 'https://api.dhan.co';
  private static readonly EDGE_FUNCTION_URL = '/api/dhan-proxy';
  
  private static accessToken: string | null = null;
  private static tokenExpiry: number | null = null;
  private static credentials: DhanCredentials | null = null;
  private static requestQueue: Promise<any>[] = [];
  private static maxConcurrentRequests = 5;
  private static requestsInProgress = 0;
  private static lastRequestTime = 0;
  private static minRequestInterval = 500; // 500ms between requests to avoid rate limiting
  private static retryCount = 3;
  private static retryDelay = 1000; // 1 second

  // Initialize with credentials
  public static initialize(credentials: DhanCredentials): void {
    this.credentials = credentials;
    console.log('Dhan API Service initialized with client ID:', credentials.clientId);
    
    // Set the access token directly if it's provided in the credentials
    if (credentials.clientSecret && credentials.clientSecret.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9')) {
      this.accessToken = credentials.clientSecret;
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      console.log('Using provided JWT token as access token');
    }
  }

  // Authenticate with Dhan API
  public static async authenticate(): Promise<boolean> {
    try {
      if (!this.credentials) {
        throw new Error('Dhan credentials not initialized');
      }

      // Check if we already have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log('Using existing Dhan API token');
        return true;
      }

      console.log('Authenticating with Dhan API...');
      
      // For demo purposes, if the client secret is a JWT token, use it directly
      if (this.credentials.clientSecret && this.credentials.clientSecret.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9')) {
        this.accessToken = this.credentials.clientSecret;
        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        // Store the token in localStorage for persistence
        this.storeTokenInLocalStorage();
        
        console.log('Using provided JWT token as access token');
        return true;
      }
      
      // In a real implementation, we would make an API call to get a token
      const response = await this.makeRequest('post', '/oauth2/token', {
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        grant_type: 'client_credentials'
      });
      
      if (response && response.access_token) {
        this.accessToken = response.access_token;
        this.tokenExpiry = Date.now() + (response.expires_in * 1000);
        
        // Store the token in localStorage for persistence
        this.storeTokenInLocalStorage();
        
        console.log('Dhan API authentication successful, token expires in:', response.expires_in, 'seconds');
        return true;
      }
      
      console.error('Dhan API authentication failed: Invalid response format');
      return false;
    } catch (error) {
      console.error('Failed to authenticate with Dhan API:', error);
      return false;
    }
  }

  // Store token in localStorage for persistence
  private static storeTokenInLocalStorage(): void {
    try {
      if (!this.accessToken || !this.tokenExpiry || !this.credentials) {
        return;
      }
      
      // Get current user ID from localStorage
      const currentUser = localStorage.getItem('traderdesk_user');
      if (!currentUser) {
        console.warn('No current user found, skipping token storage');
        return;
      }
      
      const user = JSON.parse(currentUser);
      
      LocalStorageService.saveBrokerToken({
        id: crypto.randomUUID(),
        user_id: user.id,
        broker: 'dhan',
        client_id: this.credentials.clientId,
        access_token: this.accessToken,
        expires_at: new Date(this.tokenExpiry).toISOString(),
        created_at: new Date().toISOString()
      });
      
      console.log('Dhan API token stored in localStorage');
    } catch (error) {
      console.error('Error storing token in localStorage:', error);
    }
  }

  // Get user profile
  public static async getUserProfile(): Promise<any> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching user profile from Dhan API...');
      
      return await this.makeRequest('get', '/user/profile');
    } catch (error) {
      console.error('Failed to fetch user profile from Dhan API:', error);
      return null;
    }
  }

  // Get holdings
  public static async getHoldings(): Promise<DhanHolding[]> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching holdings from Dhan API...');
      
      const response = await this.makeRequest('get', '/portfolio/holdings');
      return this.parseHoldings(response);
    } catch (error) {
      console.error('Failed to fetch holdings from Dhan API:', error);
      return [];
    }
  }

  // Get positions
  public static async getPositions(): Promise<DhanPosition[]> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching positions from Dhan API...');
      
      const response = await this.makeRequest('get', '/portfolio/positions');
      return this.parsePositions(response);
    } catch (error) {
      console.error('Failed to fetch positions from Dhan API:', error);
      return [];
    }
  }

  // Get orders
  public static async getOrders(): Promise<DhanOrder[]> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching orders from Dhan API...');
      
      const response = await this.makeRequest('get', '/orders');
      return this.parseOrders(response);
    } catch (error) {
      console.error('Failed to fetch orders from Dhan API:', error);
      return [];
    }
  }

  // Place equity order
  public static async placeEquityOrder(orderParams: DhanOrderParams): Promise<any> {
    try {
      await this.ensureAuthenticated();
      
      // Validate order parameters
      this.validateOrderParams(orderParams);
      
      console.log('Placing equity order with Dhan API:', orderParams);
      
      // Log the order attempt to localStorage
      await this.logOrderAttempt('equity', orderParams);
      
      const response = await this.makeRequest('post', '/orders/equity', orderParams);
      
      // Log the order result to localStorage
      await this.logOrderResult('equity', orderParams, response);
      
      return response;
    } catch (error) {
      console.error('Failed to place equity order with Dhan API:', error);
      
      // Log the order error to localStorage
      await this.logOrderError('equity', orderParams, error);
      
      throw error;
    }
  }

  // Place futures order
  public static async placeFuturesOrder(orderParams: DhanFutureOrderParams): Promise<any> {
    try {
      await this.ensureAuthenticated();
      
      // Validate order parameters
      this.validateOrderParams(orderParams);
      if (!orderParams.expiry) {
        throw new Error('Expiry date is required for futures orders');
      }
      
      console.log('Placing futures order with Dhan API:', orderParams);
      
      // Log the order attempt to localStorage
      await this.logOrderAttempt('futures', orderParams);
      
      const response = await this.makeRequest('post', '/orders/futures', orderParams);
      
      // Log the order result to localStorage
      await this.logOrderResult('futures', orderParams, response);
      
      return response;
    } catch (error) {
      console.error('Failed to place futures order with Dhan API:', error);
      
      // Log the order error to localStorage
      await this.logOrderError('futures', orderParams, error);
      
      throw error;
    }
  }

  // Log order attempt to localStorage
  private static async logOrderAttempt(orderType: string, orderParams: any): Promise<void> {
    try {
      // Get current user ID from localStorage
      const currentUser = localStorage.getItem('traderdesk_user');
      if (!currentUser) {
        console.warn('No current user found, skipping order log');
        return;
      }
      
      const user = JSON.parse(currentUser);
      
      LocalStorageService.logOrder({
        user_id: user.id,
        order_type: orderType,
        params: orderParams,
        status: 'attempted',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging order attempt to localStorage:', error);
    }
  }

  // Log order result to localStorage
  private static async logOrderResult(orderType: string, orderParams: any, response: any): Promise<void> {
    try {
      // Get current user ID from localStorage
      const currentUser = localStorage.getItem('traderdesk_user');
      if (!currentUser) {
        console.warn('No current user found, skipping order log');
        return;
      }
      
      const user = JSON.parse(currentUser);
      
      LocalStorageService.logOrder({
        user_id: user.id,
        order_type: orderType,
        params: orderParams,
        response: response,
        status: 'completed',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging order result to localStorage:', error);
    }
  }

  // Log order error to localStorage
  private static async logOrderError(orderType: string, orderParams: any, error: any): Promise<void> {
    try {
      // Get current user ID from localStorage
      const currentUser = localStorage.getItem('traderdesk_user');
      if (!currentUser) {
        console.warn('No current user found, skipping order log');
        return;
      }
      
      const user = JSON.parse(currentUser);
      
      LocalStorageService.logOrder({
        user_id: user.id,
        order_type: orderType,
        params: orderParams,
        error: error.message || 'Unknown error',
        status: 'failed',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging order error to localStorage:', error);
    }
  }

  // Modify order
  public static async modifyOrder(orderId: string, updates: Partial<DhanOrderParams>): Promise<any> {
    try {
      await this.ensureAuthenticated();
      console.log('Modifying order with Dhan API:', orderId, updates);
      
      return await this.makeRequest('put', `/orders/${orderId}`, updates);
    } catch (error) {
      console.error(`Failed to modify order ${orderId} with Dhan API:`, error);
      throw error;
    }
  }

  // Cancel order
  public static async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      console.log('Cancelling order with Dhan API:', orderId);
      
      await this.makeRequest('delete', `/orders/${orderId}`);
      return true;
    } catch (error) {
      console.error(`Failed to cancel order ${orderId} with Dhan API:`, error);
      return false;
    }
  }

  // Get funds
  public static async getFunds(): Promise<any> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching funds from Dhan API...');
      
      return await this.makeRequest('get', '/user/funds');
    } catch (error) {
      console.error('Failed to fetch funds from Dhan API:', error);
      return null;
    }
  }

  // Get market status
  public static async getMarketStatus(): Promise<any> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching market status from Dhan API...');
      
      return await this.makeRequest('get', '/market/status');
    } catch (error) {
      console.error('Failed to fetch market status from Dhan API:', error);
      return null;
    }
  }

  // Get historical data
  public static async getHistoricalData(symbol: string, exchange: string, interval: string, from: string, to: string): Promise<any> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching historical data from Dhan API:', symbol, exchange, interval);
      
      // Convert exchange to Dhan's exchange segment format
      const exchangeSegment = exchange === 'NSE' ? 'NSE_EQ' : 'BSE_EQ';
      
      const requestBody = {
        securityId: symbol, // Use symbol directly, securityId is not available
        exchangeSegment: exchangeSegment,
        instrument: "EQUITY",
        expiryCode: 0,
        oi: false,
        fromDate: from,
        toDate: to
      };

      const response = await this.makeRequest('post', '/charts/historical', requestBody);
      
      if (!response || !response.open || !response.close) {
        throw new Error('Invalid response from Dhan API');
      }

      // Transform the response into candle format
      const candles = [];
      for (let i = 0; i < response.open.length; i++) {
        candles.push({
          timestamp: new Date(response.timestamp[i] * 1000).toISOString(),
          open: response.open[i],
          high: response.high[i],
          low: response.low[i],
          close: response.close[i],
          volume: response.volume[i]
        });
      }

      return candles;
    } catch (error) {
      console.error('Failed to fetch historical data from Dhan API:', error);
      return null;
    }
  }

  // Get option chain
  public static async getOptionChain(symbol: string, expiry: string): Promise<any> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching option chain from Dhan API:', symbol, expiry);
      
      return await this.makeRequest('get', '/market/option-chain', null, {
        symbol,
        expiry
      });
    } catch (error) {
      console.error('Failed to fetch option chain from Dhan API:', error);
      return null;
    }
  }

  // Get available expiry dates
  public static async getExpiryDates(symbol: string): Promise<string[]> {
    try {
      await this.ensureAuthenticated();
      console.log('Fetching expiry dates from Dhan API:', symbol);
      
      const response = await this.makeRequest('get', '/market/expiry-dates', null, { symbol });
      return response?.expiryDates || [];
    } catch (error) {
      console.error('Failed to fetch expiry dates from Dhan API:', error);
      return [];
    }
  }

  // Get live market feed
  public static async subscribeLiveMarketFeed(symbols: string[]): Promise<any> {
    try {
      await this.ensureAuthenticated();
      console.log('Subscribing to live market feed from Dhan API:', symbols);
      
      // In a real implementation, this would use WebSockets
      // For now, we'll simulate a response
      return {
        status: 'success',
        message: 'Subscribed to live market feed',
        symbols
      };
    } catch (error) {
      console.error('Failed to subscribe to live market feed from Dhan API:', error);
      return null;
    }
  }

  // Helper methods
  private static async ensureAuthenticated(): Promise<void> {
    const isAuthenticated = await this.authenticate();
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate with Dhan API');
    }
  }

  private static getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  private static parseHoldings(data: any): DhanHolding[] {
    if (!data?.holdings) return [];

    return data.holdings.map((holding: any) => ({
      symbol: holding.tradingSymbol,
      exchange: holding.exchange,
      quantity: holding.quantity,
      averagePrice: holding.averagePrice,
      lastPrice: holding.lastPrice,
      pnl: holding.pnl,
      pnlPercentage: holding.pnlPercentage
    }));
  }

  private static parsePositions(data: any): DhanPosition[] {
    if (!data?.positions) return [];

    return data.positions.map((position: any) => ({
      symbol: position.tradingSymbol,
      exchange: position.exchange,
      product: position.product,
      quantity: position.quantity,
      averagePrice: position.averagePrice,
      lastPrice: position.lastPrice,
      pnl: position.pnl,
      pnlPercentage: position.pnlPercentage
    }));
  }

  private static parseOrders(data: any): DhanOrder[] {
    if (!data?.orders) return [];

    return data.orders.map((order: any) => ({
      orderId: order.orderId,
      symbol: order.tradingSymbol,
      exchange: order.exchange,
      transactionType: order.transactionType,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      orderTimestamp: order.orderTimestamp
    }));
  }

  private static validateOrderParams(params: DhanOrderParams): void {
    // Required fields
    if (!params.symbol) throw new Error('Symbol is required');
    if (!params.exchange) throw new Error('Exchange is required');
    if (!params.transactionType) throw new Error('Transaction type is required');
    if (!params.quantity || params.quantity <= 0) throw new Error('Valid quantity is required');
    if (!params.productType) throw new Error('Product type is required');
    if (!params.orderType) throw new Error('Order type is required');
    if (!params.validity) throw new Error('Validity is required');
    
    // Conditional validations
    if ((params.orderType === 'LIMIT' || params.orderType === 'SL') && !params.price) {
      throw new Error('Price is required for LIMIT and SL orders');
    }
    
    if ((params.orderType === 'SL' || params.orderType === 'SLM') && !params.triggerPrice) {
      throw new Error('Trigger price is required for SL and SLM orders');
    }
    
    // Validate exchange
    const validExchanges = ['NSE', 'BSE', 'NFO', 'CDS', 'MCX'];
    if (!validExchanges.includes(params.exchange)) {
      throw new Error(`Invalid exchange: ${params.exchange}. Valid exchanges are: ${validExchanges.join(', ')}`);
    }
    
    // Validate transaction type
    if (!['BUY', 'SELL'].includes(params.transactionType)) {
      throw new Error('Transaction type must be either BUY or SELL');
    }
    
    // Validate product type
    if (!['INTRADAY', 'DELIVERY', 'MARGIN'].includes(params.productType)) {
      throw new Error('Product type must be one of: INTRADAY, DELIVERY, MARGIN');
    }
    
    // Validate order type
    if (!['LIMIT', 'MARKET', 'SL', 'SLM'].includes(params.orderType)) {
      throw new Error('Order type must be one of: LIMIT, MARKET, SL, SLM');
    }
    
    // Validate validity
    if (!['DAY', 'IOC'].includes(params.validity)) {
      throw new Error('Validity must be either DAY or IOC');
    }
  }

  // Rate-limited request queue implementation with retries
  private static async makeRequest(
    method: string, 
    endpoint: string, 
    data: any = null, 
    params: any = null,
    retryCount: number = 0
  ): Promise<any> {
    // Create a promise that will be resolved when the request is processed
    return new Promise((resolve, reject) => {
      const processRequest = async () => {
        try {
          // Ensure we don't exceed rate limits
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(r => setTimeout(r, this.minRequestInterval - timeSinceLastRequest));
          }
          
          this.lastRequestTime = Date.now();
          this.requestsInProgress++;
          
          // Determine if we should use the edge function or direct API call
          const url = this.EDGE_FUNCTION_URL 
            ? `${this.EDGE_FUNCTION_URL}${endpoint}`
            : `${this.DHAN_API_BASE_URL}${endpoint}`;
          
          const headers = this.accessToken ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };
          
          const config: any = {
            method,
            url,
            headers
          };
          
          if (data) {
            config.data = data;
          }
          
          if (params) {
            config.params = params;
          }
          
          const response = await axios(config);
          
          this.requestsInProgress--;
          this.processNextRequest();
          
          resolve(response.data);
        } catch (error) {
          this.requestsInProgress--;
          this.processNextRequest();
          
          // Enhanced error handling with retries
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            
            // Retry on certain error codes
            if ((status === 429 || status === 503 || status === 504) && retryCount < this.retryCount) {
              console.warn(`Request failed with status ${status}, retrying (${retryCount + 1}/${this.retryCount})...`);
              
              // Exponential backoff
              const delay = this.retryDelay * Math.pow(2, retryCount);
              setTimeout(() => {
                this.makeRequest(method, endpoint, data, params, retryCount + 1)
                  .then(resolve)
                  .catch(reject);
              }, delay);
              return;
            }
            
            if (status === 401) {
              // Token expired, clear it so it will be refreshed on next request
              this.accessToken = null;
              this.tokenExpiry = null;
              reject(new Error('Authentication token expired. Please re-authenticate.'));
            } else if (status === 429) {
              // Rate limited
              reject(new Error('Rate limit exceeded. Please try again later.'));
            } else {
              reject(new Error(`API request failed: ${errorData?.message || error.message}`));
            }
          } else {
            reject(error);
          }
        }
      };
      
      // Add the request to the queue
      this.requestQueue.push(processRequest());
      
      // Process the queue if we're not at the concurrency limit
      if (this.requestsInProgress < this.maxConcurrentRequests) {
        this.processNextRequest();
      }
    });
  }

  private static async processNextRequest(): Promise<void> {
    if (this.requestQueue.length > 0 && this.requestsInProgress < this.maxConcurrentRequests) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        await nextRequest;
      }
    }
  }
}