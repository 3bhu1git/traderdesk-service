import { DataService } from './DataService';

interface WebSocketMessage {
  symbol: string;
  lastPrice: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, ((data: WebSocketMessage) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private buildWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/market`;
  }

  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = this.buildWsUrl();
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.resubscribeAll();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.handleReconnect();
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, this.reconnectInterval);
  }

  public subscribe(symbol: string, callback: (data: WebSocketMessage) => void): void {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, []);
    }
    this.subscriptions.get(symbol)?.push(callback);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribeMessage([symbol]);
    }
  }

  public unsubscribe(symbol: string, callback?: (data: WebSocketMessage) => void): void {
    if (callback) {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.subscriptions.delete(symbol);
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.sendUnsubscribeMessage([symbol]);
          }
        }
      }
    } else {
      this.subscriptions.delete(symbol);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendUnsubscribeMessage([symbol]);
      }
    }
  }

  private resubscribeAll(): void {
    const symbols = Array.from(this.subscriptions.keys());
    if (symbols.length > 0) {
      this.sendSubscribeMessage(symbols);
    }
  }

  private sendSubscribeMessage(symbols: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      action: 'subscribe',
      symbols
    };
    this.ws.send(JSON.stringify(message));
  }

  private sendUnsubscribeMessage(symbols: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      action: 'unsubscribe',
      symbols
    };
    this.ws.send(JSON.stringify(message));
  }

  private handleMessage(message: WebSocketMessage): void {
    const callbacks = this.subscriptions.get(message.symbol);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }

  public close(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
}

export default WebSocketService; 