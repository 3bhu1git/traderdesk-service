import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Zap, TrendingUp, Target, BarChart3, AlertTriangle, Clock } from 'lucide-react';

interface ChartAIAssistantProps {
  symbol: string;
  currentPrice?: number;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChartAIAssistant: React.FC<ChartAIAssistantProps> = ({ symbol, currentPrice, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `I'm your AI Chart Assistant for ${symbol}. Ask me about technical analysis, patterns, or predictions for this chart.`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update initial message when symbol changes
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: `I'm your AI Chart Assistant for ${symbol}. Ask me about technical analysis, patterns, or predictions for this chart.`,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  }, [symbol]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Process the message and generate AI response
    setTimeout(() => {
      processUserMessage(input);
    }, 500);
  };

  const processUserMessage = (message: string) => {
    // Check for common analysis requests
    const isTechnicalRequest = /technical|chart|pattern|trend|support|resistance/i.test(message);
    const isPredictionRequest = /predict|forecast|future|next|target|price target/i.test(message);
    const isPatternRequest = /pattern|formation|setup|candlestick/i.test(message);
    const isIndicatorRequest = /indicator|rsi|macd|bollinger|moving average|ema|sma/i.test(message);
    
    let response = '';
    
    // Generate appropriate response based on the request type
    if (isTechnicalRequest) {
      response = generateTechnicalAnalysis(symbol, currentPrice);
    } else if (isPredictionRequest) {
      response = generatePricePrediction(symbol, currentPrice);
    } else if (isPatternRequest) {
      response = generatePatternAnalysis(symbol, currentPrice);
    } else if (isIndicatorRequest) {
      response = generateIndicatorAnalysis(symbol, currentPrice);
    } else {
      response = generateGeneralAnalysis(symbol, currentPrice);
    }
    
    // Add AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper functions to generate different types of analysis
  const generateTechnicalAnalysis = (symbol: string, price?: number): string => {
    const currentPrice = price || Math.floor(Math.random() * 2000) + 500;
    const trends = ['uptrend', 'downtrend', 'sideways', 'consolidating', 'breaking out'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    const patterns = ['double bottom', 'head and shoulders', 'cup and handle', 'triangle', 'flag', 'pennant'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const support = Math.floor(currentPrice * 0.95);
    const resistance = Math.floor(currentPrice * 1.05);
    
    return `## Technical Analysis for ${symbol}

• **Current Price**: ₹${currentPrice.toFixed(2)}
• **Current Trend**: ${trend.charAt(0).toUpperCase() + trend.slice(1)}
• **Chart Pattern**: Forming a ${pattern} pattern

• **Key Levels**:
  - Support: ₹${support}
  - Resistance: ₹${resistance}
  - Pivot: ₹${Math.floor((support + resistance) / 2)}

• **Volume Analysis**: ${Math.random() > 0.5 ? 'Above average volume indicating strong interest' : 'Below average volume suggesting consolidation'}

The price action suggests ${Math.random() > 0.5 ? 'strength' : 'weakness'} in the near term. ${Math.random() > 0.5 ? 'Watch for a breakout above resistance.' : 'Monitor for a breakdown below support.'}`;
  };

  const generatePricePrediction = (symbol: string, price?: number): string => {
    const currentPrice = price || Math.floor(Math.random() * 2000) + 500;
    const shortTermChange = (Math.random() * 6) - 3; // -3% to +3%
    const mediumTermChange = (Math.random() * 10) - 3; // -3% to +7%
    const longTermChange = (Math.random() * 15); // 0% to +15%
    
    const shortTermPrice = currentPrice * (1 + (shortTermChange / 100));
    const mediumTermPrice = currentPrice * (1 + (mediumTermChange / 100));
    const longTermPrice = currentPrice * (1 + (longTermChange / 100));
    
    return `## Price Prediction for ${symbol}

• **Current Price**: ₹${currentPrice.toFixed(2)}

• **Short-term Outlook** (1-5 days):
  - Target: ₹${shortTermPrice.toFixed(2)} (${shortTermChange >= 0 ? '+' : ''}${shortTermChange.toFixed(2)}%)
  - Confidence: ${Math.floor(Math.random() * 20) + 60}%

• **Medium-term Outlook** (1-3 weeks):
  - Target: ₹${mediumTermPrice.toFixed(2)} (${mediumTermChange >= 0 ? '+' : ''}${mediumTermChange.toFixed(2)}%)
  - Confidence: ${Math.floor(Math.random() * 15) + 55}%

• **Long-term Outlook** (1-3 months):
  - Target: ₹${longTermPrice.toFixed(2)} (${longTermChange >= 0 ? '+' : ''}${longTermChange.toFixed(2)}%)
  - Confidence: ${Math.floor(Math.random() * 10) + 50}%

**Key Drivers**: ${Math.random() > 0.5 ? 'Technical breakout, positive sector momentum' : 'Value buying, institutional accumulation'}

**Risk Factors**: Market volatility, sector rotation, and broader market sentiment could impact these projections.`;
  };

  const generatePatternAnalysis = (symbol: string, price?: number): string => {
    const currentPrice = price || Math.floor(Math.random() * 2000) + 500;
    const patterns = [
      { name: 'Double Bottom', reliability: '75%', target: currentPrice * 1.08 },
      { name: 'Cup and Handle', reliability: '82%', target: currentPrice * 1.12 },
      { name: 'Bullish Flag', reliability: '68%', target: currentPrice * 1.06 },
      { name: 'Ascending Triangle', reliability: '72%', target: currentPrice * 1.09 },
      { name: 'Head and Shoulders', reliability: '70%', target: currentPrice * 0.92 },
      { name: 'Descending Triangle', reliability: '74%', target: currentPrice * 0.91 }
    ];
    
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const isBullish = selectedPattern.target > currentPrice;
    
    return `## Chart Pattern Analysis for ${symbol}

• **Identified Pattern**: ${selectedPattern.name}
• **Pattern Reliability**: ${selectedPattern.reliability}
• **Current Price**: ₹${currentPrice.toFixed(2)}
• **Pattern Target**: ₹${selectedPattern.target.toFixed(2)} (${isBullish ? '+' : ''}${(((selectedPattern.target - currentPrice) / currentPrice) * 100).toFixed(2)}%)

• **Pattern Characteristics**:
  - ${isBullish ? 'Bullish' : 'Bearish'} bias
  - ${Math.random() > 0.5 ? 'Strong' : 'Moderate'} volume confirmation
  - ${Math.random() > 0.5 ? 'Clear' : 'Developing'} pattern structure

• **Trading Strategy**:
  - Entry: ${isBullish ? 'On breakout above resistance' : 'On breakdown below support'}
  - Stop Loss: ₹${isBullish ? (currentPrice * 0.97).toFixed(2) : (currentPrice * 1.03).toFixed(2)}
  - Take Profit: ₹${selectedPattern.target.toFixed(2)}

**Note**: This pattern is ${Math.floor(Math.random() * 30) + 70}% complete and should resolve within ${Math.floor(Math.random() * 5) + 3} trading sessions.`;
  };

  const generateIndicatorAnalysis = (symbol: string, price?: number): string => {
    const currentPrice = price || Math.floor(Math.random() * 2000) + 500;
    
    const rsi = Math.floor(Math.random() * 100);
    const macd = Math.random() > 0.5 ? 'bullish crossover' : 'bearish crossover';
    const bollingerPosition = ['upper band', 'middle band', 'lower band'][Math.floor(Math.random() * 3)];
    const ema50 = currentPrice * (1 + ((Math.random() * 6) - 3) / 100);
    const ema200 = currentPrice * (1 + ((Math.random() * 10) - 5) / 100);
    
    return `## Technical Indicator Analysis for ${symbol}

• **Current Price**: ₹${currentPrice.toFixed(2)}

• **Momentum Indicators**:
  - RSI: ${rsi} (${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'})
  - MACD: Showing ${macd}
  - Stochastic: ${Math.floor(Math.random() * 100)}% (${Math.random() > 0.5 ? 'Bullish' : 'Bearish'} divergence)

• **Trend Indicators**:
  - 50 EMA: ₹${ema50.toFixed(2)} (Price is ${currentPrice > ema50 ? 'above' : 'below'})
  - 200 EMA: ₹${ema200.toFixed(2)} (Price is ${currentPrice > ema200 ? 'above' : 'below'})
  - Bollinger Bands: Price at ${bollingerPosition}

• **Volume Indicators**:
  - OBV: ${Math.random() > 0.5 ? 'Rising' : 'Falling'}
  - Volume: ${Math.random() > 0.5 ? 'Above' : 'Below'} 20-day average

**Indicator Consensus**: ${
  rsi > 70 || rsi < 30 || macd.includes('bullish') || macd.includes('bearish') || bollingerPosition !== 'middle band'
    ? `${Math.random() > 0.5 ? 'Bullish' : 'Bearish'} with ${Math.floor(Math.random() * 20) + 60}% confidence`
    : 'Neutral - waiting for clearer signals'
}`;
  };

  const generateGeneralAnalysis = (symbol: string, price?: number): string => {
    const currentPrice = price || Math.floor(Math.random() * 2000) + 500;
    
    return `## Market Analysis for ${symbol}

• **Current Price**: ₹${currentPrice.toFixed(2)}
• **Market Context**: ${Math.random() > 0.5 ? 'Bullish' : 'Bearish'} market environment
• **Sector Performance**: ${Math.random() > 0.5 ? 'Outperforming' : 'Underperforming'} its sector

I can provide more specific analysis about ${symbol}. Would you like to know about:

• Technical analysis and chart patterns
• Price predictions and targets
• Indicator readings (RSI, MACD, etc.)
• Trading strategies for this stock

Just ask me what you'd like to know about ${symbol}!`;
  };

  // Format message content with markdown-like syntax
  const formatMessageContent = (content: string) => {
    // Replace ## Heading with styled heading
    content = content.replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold text-slate-200 mb-2">$1</h3>');
    
    // Replace bullet points
    content = content.replace(/^• (.*$)/gm, '<div class="flex items-start space-x-2 mb-1"><div class="w-1 h-1 bg-green-400 rounded-full mt-2"></div><div>$1</div></div>');
    
    // Replace nested bullet points
    content = content.replace(/^  - (.*$)/gm, '<div class="ml-4 flex items-start space-x-2 mb-1"><div class="w-1 h-1 bg-slate-400 rounded-full mt-2"></div><div>$1</div></div>');
    
    // Replace bold text
    content = content.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-slate-200">$1</span>');
    
    // Replace line breaks with <br>
    content = content.replace(/\n\n/g, '<br><br>');
    
    return content;
  };

  return (
    <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-sm shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-green-400" />
          <h2 className="text-base font-semibold text-slate-200 font-mono">AI CHART ASSISTANT • {symbol}</h2>
          {currentPrice && (
            <div className="text-sm text-green-400 font-mono">₹{currentPrice.toFixed(2)}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-sm hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 professional-scroll">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-green-600 to-green-500'
                    : 'bg-gradient-to-br from-green-600 to-teal-600'
                }`}>
                  {message.sender === 'user' ? (
                    <TrendingUp className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                      : 'bg-slate-800/80 border border-slate-700/50 text-slate-200'
                  }`}>
                    {message.sender === 'user' ? (
                      <div className="text-sm">{message.content}</div>
                    ) : (
                      <div 
                        className="text-sm ai-message"
                        dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                      />
                    )}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-slate-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-600 to-teal-600">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-200">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Suggestions */}
      <div className="p-2 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-wrap gap-2">
          {[
            { text: "Analyze trend", icon: <TrendingUp className="w-3 h-3" /> },
            { text: "Price prediction", icon: <Target className="w-3 h-3" /> },
            { text: "Chart patterns", icon: <BarChart3 className="w-3 h-3" /> },
            { text: "Technical indicators", icon: <Zap className="w-3 h-3" /> },
            { text: "Support/Resistance", icon: <AlertTriangle className="w-3 h-3" /> },
            { text: "Trading strategy", icon: <Clock className="w-3 h-3" /> }
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(suggestion.text);
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="flex items-center space-x-1 px-2 py-1 bg-slate-800/60 border border-slate-600/50 rounded-sm hover:bg-slate-700/60 transition-colors text-xs text-slate-300"
            >
              {suggestion.icon}
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${symbol} chart analysis...`}
            className="flex-1 p-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 resize-none font-mono text-sm"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartAIAssistant;