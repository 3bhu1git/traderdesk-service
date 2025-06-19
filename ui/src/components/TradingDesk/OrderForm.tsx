import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Loader, Info } from 'lucide-react';
import { DhanApiService, DhanOrderParams, DhanFutureOrderParams } from '../../services/dhanApiService';
import { useAuth } from '../../context/AuthContext';
import { LocalStorageService } from '../../lib/localStorage';

interface OrderFormProps {
  symbol: string;
  currentPrice?: number;
  isDhanConnected: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ symbol, currentPrice, isDhanConnected }) => {
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'SL' | 'SLM'>('LIMIT');
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [productType, setProductType] = useState<'INTRADAY' | 'DELIVERY' | 'MARGIN'>('INTRADAY');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(currentPrice || 0);
  const [triggerPrice, setTriggerPrice] = useState<number>(0);
  const [validity, setValidity] = useState<'DAY' | 'IOC'>('DAY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFutures, setIsFutures] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [lotSize, setLotSize] = useState<number>(1);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // Update price when currentPrice changes
  useEffect(() => {
    if (currentPrice) {
      setPrice(currentPrice);
      // Set trigger price slightly below current price for buy orders and above for sell orders
      if (transactionType === 'BUY') {
        setTriggerPrice(Math.floor(currentPrice * 0.99));
      } else {
        setTriggerPrice(Math.ceil(currentPrice * 1.01));
      }
    }
  }, [currentPrice, transactionType]);

  // Check if symbol is a futures contract and get lot size
  useEffect(() => {
    const isFuturesSymbol = symbol.includes('FUT') || symbol === 'NIFTY' || symbol === 'BANKNIFTY';
    setIsFutures(isFuturesSymbol);
    
    // Get lot size from scrip master
    const getLotSize = async () => {
      try {
        // For demo purposes, set default lot sizes for common indices
        if (symbol === 'NIFTY') {
          setLotSize(50);
        } else if (symbol === 'BANKNIFTY') {
          setLotSize(25);
        } else if (symbol === 'FINNIFTY') {
          setLotSize(40);
        } else {
          // Default lot size
          setLotSize(1);
        }
        
        // Update quantity to be a multiple of lot size
        if (isFuturesSymbol) {
          const newLotSize = symbol === 'NIFTY' ? 50 : symbol === 'BANKNIFTY' ? 25 : symbol === 'FINNIFTY' ? 40 : 1;
          setQuantity(newLotSize);
        }
      } catch (error) {
        console.error('Error getting lot size:', error);
      }
    };
    
    getLotSize();
    
    // Fetch expiry dates for futures
    const fetchExpiryDates = async () => {
      if (isFuturesSymbol && isDhanConnected) {
        try {
          const dates = await DhanApiService.getExpiryDates(symbol);
          setExpiryDates(dates);
          if (dates.length > 0) {
            setExpiryDate(dates[0]);
          }
        } catch (error) {
          console.error('Error fetching expiry dates:', error);
        }
      }
    };
    
    fetchExpiryDates();
    
    // Fetch order history
    fetchOrderHistory();
  }, [symbol, isDhanConnected]);

  // Fetch order history from localStorage
  const fetchOrderHistory = async () => {
    try {
      if (!user?.id) return;
      
      const orderLogs = LocalStorageService.getOrderLogs(user.id);
      const completedOrders = orderLogs
        .filter(log => log.status === 'completed')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setOrderHistory(completedOrders);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isDhanConnected) {
      setError('Please connect to Dhan broker first');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate order parameters
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      if (isFutures && quantity % lotSize !== 0) {
        throw new Error(`Quantity must be a multiple of lot size (${lotSize})`);
      }
      
      if (orderType === 'LIMIT' && price <= 0) {
        throw new Error('Price must be greater than 0 for LIMIT orders');
      }
      
      if ((orderType === 'SL' || orderType === 'SLM') && triggerPrice <= 0) {
        throw new Error('Trigger price must be greater than 0 for SL/SLM orders');
      }
      
      // Create order parameters
      const baseOrderParams: DhanOrderParams = {
        symbol,
        exchange: 'NSE',
        transactionType,
        quantity,
        productType,
        orderType,
        validity,
        price: orderType === 'MARKET' || orderType === 'SLM' ? undefined : price,
        triggerPrice: orderType === 'SL' || orderType === 'SLM' ? triggerPrice : undefined
      };
      
      let response;
      
      if (isFutures) {
        if (!expiryDate) {
          throw new Error('Expiry date is required for futures orders');
        }
        
        const futuresOrderParams: DhanFutureOrderParams = {
          ...baseOrderParams,
          exchange: 'NFO',
          expiry: expiryDate
        };
        
        response = await DhanApiService.placeFuturesOrder(futuresOrderParams);
      } else {
        response = await DhanApiService.placeEquityOrder(baseOrderParams);
      }
      
      if (response && response.orderId) {
        setSuccess(`Order placed successfully! Order ID: ${response.orderId}`);
        
        // Log order to localStorage
        if (user?.id) {
          LocalStorageService.logOrder({
            user_id: user.id,
            order_type: isFutures ? 'futures' : 'equity',
            params: isFutures ? { ...baseOrderParams, expiry: expiryDate } : baseOrderParams,
            response,
            status: 'completed',
            created_at: new Date().toISOString()
          });
        }
        
        // Fetch updated order history
        fetchOrderHistory();
      } else {
        throw new Error('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Log failed order to localStorage
      if (user?.id) {
        LocalStorageService.logOrder({
          user_id: user.id,
          order_type: isFutures ? 'futures' : 'equity',
          params: isFutures ? { 
            symbol, 
            exchange: 'NFO', 
            transactionType, 
            quantity, 
            productType, 
            orderType, 
            validity, 
            price, 
            triggerPrice, 
            expiry: expiryDate 
          } : { 
            symbol, 
            exchange: 'NSE', 
            transactionType, 
            quantity, 
            productType, 
            orderType, 
            validity, 
            price, 
            triggerPrice 
          },
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'failed',
          created_at: new Date().toISOString()
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (value: number) => {
    if (isFutures) {
      // Ensure quantity is a multiple of lot size
      const newQuantity = Math.max(1, Math.round(value / lotSize) * lotSize);
      setQuantity(newQuantity);
    } else {
      setQuantity(value);
    }
  };

  return (
    <div className="professional-card p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-200 font-mono">PLACE ORDER</h3>
        <button
          onClick={() => setShowOrderHistory(!showOrderHistory)}
          className="text-xs text-green-400 hover:text-green-300 font-mono"
        >
          {showOrderHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      
      {showOrderHistory && orderHistory.length > 0 && (
        <div className="mb-4 bg-slate-800/30 border border-slate-700/50 rounded-sm p-2 max-h-40 overflow-y-auto professional-scroll">
          <h4 className="text-xs font-semibold text-slate-300 mb-2 font-mono">RECENT ORDERS</h4>
          <div className="space-y-2">
            {orderHistory.map((order, index) => (
              <div key={index} className="text-xs border-b border-slate-700/30 pb-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-mono">{order.params?.symbol || 'Unknown'}</span>
                  <span className={`font-mono ${order.params?.transactionType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {order.params?.transactionType || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Qty: {order.params?.quantity || 0}</span>
                  <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isDhanConnected ? (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-3 flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-400 font-mono">BROKER NOT CONNECTED</p>
            <p className="text-xs text-slate-400 mt-1">Connect to Dhan broker to place orders</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">TRANSACTION TYPE</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setTransactionType('BUY')}
                className={`flex-1 py-2 rounded-sm text-sm font-mono ${
                  transactionType === 'BUY'
                    ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-600/50 hover:bg-slate-700/60'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('SELL')}
                className={`flex-1 py-2 rounded-sm text-sm font-mono ${
                  transactionType === 'SELL'
                    ? 'bg-red-600/30 text-red-300 border border-red-600/50'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-600/50 hover:bg-slate-700/60'
                }`}
              >
                SELL
              </button>
            </div>
          </div>
          
          {/* Product Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">PRODUCT TYPE</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
            >
              <option value="INTRADAY">INTRADAY</option>
              <option value="DELIVERY">DELIVERY</option>
              <option value="MARGIN">MARGIN</option>
            </select>
          </div>
          
          {/* Order Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">ORDER TYPE</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
            >
              <option value="LIMIT">LIMIT</option>
              <option value="MARKET">MARKET</option>
              <option value="SL">STOP LOSS</option>
              <option value="SLM">STOP LOSS MARKET</option>
            </select>
          </div>
          
          {/* Quantity */}
          <div>
            <div className="flex justify-between">
              <label className="block text-xs text-slate-400 mb-1 font-mono">QUANTITY</label>
              {isFutures && (
                <span className="text-xs text-green-400 font-mono">Lot Size: {lotSize}</span>
              )}
            </div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
              min="1"
              step={isFutures ? lotSize : 1}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
            />
          </div>
          
          {/* Price (for LIMIT and SL orders) */}
          {(orderType === 'LIMIT' || orderType === 'SL') && (
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-mono">PRICE</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.05"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
              />
            </div>
          )}
          
          {/* Trigger Price (for SL and SLM orders) */}
          {(orderType === 'SL' || orderType === 'SLM') && (
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-mono">TRIGGER PRICE</label>
              <input
                type="number"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.05"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
              />
            </div>
          )}
          
          {/* Expiry Date (for futures) */}
          {isFutures && (
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-mono">EXPIRY DATE</label>
              <select
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
              >
                {expiryDates.length > 0 ? (
                  expiryDates.map((date) => (
                    <option key={date} value={date}>{date}</option>
                  ))
                ) : (
                  <option value="">No expiry dates available</option>
                )}
              </select>
            </div>
          )}
          
          {/* Validity */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">VALIDITY</label>
            <select
              value={validity}
              onChange={(e) => setValidity(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600/50 rounded-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-mono"
            >
              <option value="DAY">DAY</option>
              <option value="IOC">IMMEDIATE OR CANCEL</option>
            </select>
          </div>
          
          {/* Error and Success messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-sm p-3 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-xs text-red-400 font-mono">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-sm p-3 flex items-start space-x-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5" />
              <p className="text-xs text-green-400 font-mono">{success}</p>
            </div>
          )}
          
          {/* Risk Warning */}
          <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-sm p-2 flex items-start space-x-2">
            <Info className="w-3 h-3 text-yellow-400 mt-0.5" />
            <p className="text-xs text-yellow-400 font-mono">Trading involves risk. Ensure you understand the risks before placing orders.</p>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isDhanConnected}
            className={`w-full py-3 rounded-sm text-sm font-mono ${
              transactionType === 'BUY'
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600'
                : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600'
            } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <span>{transactionType} {symbol}</span>
              </>
            )}
          </button>
          
          {/* Order Summary */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-sm p-3">
            <h4 className="text-xs font-semibold text-slate-300 mb-2 font-mono">ORDER SUMMARY</h4>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Symbol:</span>
                <span className="text-slate-300">{symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-slate-300">{orderType} {transactionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span className="text-slate-300">{quantity}</span>
              </div>
              {(orderType === 'LIMIT' || orderType === 'SL') && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Price:</span>
                  <span className="text-slate-300">₹{price.toFixed(2)}</span>
                </div>
              )}
              {(orderType === 'SL' || orderType === 'SLM') && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Trigger:</span>
                  <span className="text-slate-300">₹{triggerPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Product:</span>
                <span className="text-slate-300">{productType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Validity:</span>
                <span className="text-slate-300">{validity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Value:</span>
                <span className={`${transactionType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{(quantity * (orderType === 'MARKET' || orderType === 'SLM' ? (currentPrice || 0) : price)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default OrderForm;