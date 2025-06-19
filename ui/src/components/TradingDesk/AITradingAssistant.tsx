import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingUp, TrendingDown, BarChart3, AlertTriangle, Target, Zap, Clock } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AITradingAssistantProps {
  onSymbolSelect: (symbol: string) => void;
}

const AITradingAssistant: React.FC<AITradingAssistantProps> = ({ onSymbolSelect }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI trading assistant. Ask me about any stock, index, or trading strategy, and I'll provide real-time analysis and insights.",
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
    // Extract potential stock symbols from the message
    const symbolRegex = /\b[A-Z]{2,7}\b/g;
    const potentialSymbols = message.match(symbolRegex) || [];
    
    // Check for common analysis requests
    const isAnalysisRequest = /analysis|analyze|check|what about|how is|tell me about/i.test(message);
    const isTechnicalRequest = /technical|chart|pattern|trend|support|resistance/i.test(message);
    const isFundamentalRequest = /fundamental|pe|eps|dividend|revenue|profit|growth/i.test(message);
    const isRecommendationRequest = /recommend|should i buy|should i sell|good time|entry|exit/i.test(message);
    
    let response = '';
    let detectedSymbol = '';
    
    // Detect the most likely stock symbol
    if (potentialSymbols.length > 0) {
      const commonIndices = ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];
      const commonStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN'];
      
      detectedSymbol = potentialSymbols.find(s => commonIndices.includes(s)) || 
                       potentialSymbols.find(s => commonStocks.includes(s)) ||
                       potentialSymbols[0];
    }
    
    // Generate appropriate response based on the request type
    if (detectedSymbol) {
      if (isAnalysisRequest) {
        if (isTechnicalRequest) {
          response = generateTechnicalAnalysis(detectedSymbol);
        } else if (isFundamentalRequest) {
          response = generateFundamentalAnalysis(detectedSymbol);
        } else if (isRecommendationRequest) {
          response = generateTradeRecommendation(detectedSymbol);
        } else {
          response = generateGeneralAnalysis(detectedSymbol);
        }
      } else {
        response = generateGeneralAnalysis(detectedSymbol);
      }
    } else {
      // Generic responses for non-symbol queries
      if (message.toLowerCase().includes('market')) {
        response = generateMarketOverview();
      } else if (message.toLowerCase().includes('strategy')) {
        response = generateTradingStrategy();
      } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('what can you do')) {
        response = "I can help you with:\n\n• Real-time stock analysis\n• Technical and fundamental insights\n• Market trends and sentiment\n• Trading recommendations\n• Risk assessment\n\nJust ask me about any stock (e.g., 'Analyze RELIANCE') or market condition!";
      } else {
        response = "I'm not sure what you're asking about. Could you mention a specific stock symbol or ask about the market in general?";
      }
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
    
    // If a valid symbol was detected, notify the parent component
    if (detectedSymbol && ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN'].includes(detectedSymbol)) {
      onSymbolSelect(detectedSymbol);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper functions to generate different types of analysis
  const generateTechnicalAnalysis = (symbol: string): string => {
    const trends = ['uptrend', 'downtrend', 'sideways', 'consolidating', 'breaking out'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    const patterns = ['double bottom', 'head and shoulders', 'cup and handle', 'triangle', 'flag', 'pennant'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const rsi = Math.floor(Math.random() * 100);
    const macd = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const support = Math.floor(Math.random() * 1000) + 500;
    const resistance = support + Math.floor(Math.random() * 200) + 50;
    
    return `## Technical Analysis for ${symbol}

• **Current Trend**: ${trend.charAt(0).toUpperCase() + trend.slice(1)}
• **Chart Pattern**: Forming a ${pattern} pattern
• **Key Indicators**:
  - RSI: ${rsi} (${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'})
  - MACD: Showing ${macd} crossover
  - Volume: ${Math.random() > 0.5 ? 'Above' : 'Below'} average

• **Support & Resistance**:
  - Support: ₹${support}
  - Resistance: ₹${resistance}

The price action suggests ${Math.random() > 0.5 ? 'strength' : 'weakness'} in the near term. ${Math.random() > 0.5 ? 'Watch for a breakout above resistance.' : 'Monitor for a breakdown below support.'}`;
  };

  const generateFundamentalAnalysis = (symbol: string): string => {
    const pe = (Math.random() * 30 + 10).toFixed(2);
    const eps = (Math.random() * 50 + 10).toFixed(2);
    const dividend = (Math.random() * 5).toFixed(2);
    const revenue = (Math.random() * 50000 + 10000).toFixed(0);
    const profit = (Math.random() * 10000 + 1000).toFixed(0);
    const growth = (Math.random() * 30 - 10).toFixed(2);
    
    return `## Fundamental Analysis for ${symbol}

• **Valuation Metrics**:
  - P/E Ratio: ${pe}x (${parseFloat(pe) > 25 ? 'High' : parseFloat(pe) < 15 ? 'Low' : 'Average'} valuation)
  - EPS: ₹${eps}
  - Dividend Yield: ${dividend}%

• **Financial Performance**:
  - Revenue: ₹${revenue} Cr
  - Net Profit: ₹${profit} Cr
  - YoY Growth: ${growth}%

• **Sector Comparison**: ${Math.random() > 0.5 ? 'Outperforming' : 'Underperforming'} sector peers
• **Analyst Consensus**: ${['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][Math.floor(Math.random() * 5)]}

${symbol} shows ${parseFloat(growth) > 0 ? 'positive growth trends' : 'challenging growth environment'} with ${parseFloat(pe) > 25 ? 'premium valuation' : parseFloat(pe) < 15 ? 'attractive valuation' : 'fair valuation'} compared to industry standards.`;
  };

  const generateTradeRecommendation = (symbol: string): string => {
    const action = Math.random() > 0.6 ? 'BUY' : Math.random() > 0.5 ? 'SELL' : 'HOLD';
    const currentPrice = Math.floor(Math.random() * 2000) + 500;
    const targetPrice = action === 'BUY' ? currentPrice * (1 + Math.random() * 0.2) : currentPrice * (1 - Math.random() * 0.2);
    const stopLoss = action === 'BUY' ? currentPrice * (1 - Math.random() * 0.1) : currentPrice * (1 + Math.random() * 0.1);
    const timeframe = ['short-term', 'medium-term', 'long-term'][Math.floor(Math.random() * 3)];
    const confidence = Math.floor(Math.random() * 30) + 70;
    
    return `## Trade Recommendation for ${symbol}

• **Action**: ${action}
• **Current Price**: ₹${currentPrice.toFixed(2)}
• **Target Price**: ₹${targetPrice.toFixed(2)} (${action === 'BUY' ? '+' : ''}${(((targetPrice - currentPrice) / currentPrice) * 100).toFixed(2)}%)
• **Stop Loss**: ₹${stopLoss.toFixed(2)} (${action === 'BUY' ? '-' : '+'}${(Math.abs(stopLoss - currentPrice) / currentPrice * 100).toFixed(2)}%)
• **Risk-Reward Ratio**: ${(Math.abs(targetPrice - currentPrice) / Math.abs(stopLoss - currentPrice)).toFixed(2)}
• **Timeframe**: ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
• **Confidence**: ${confidence}%

**Rationale**: ${
  action === 'BUY' 
    ? `${symbol} is showing strength with positive momentum and favorable risk-reward setup.` 
    : action === 'SELL' 
      ? `${symbol} is showing weakness with negative momentum and deteriorating technicals.`
      : `${symbol} is in a consolidation phase. Better to wait for a clear breakout or breakdown.`
}

**Key Levels to Watch**: Support at ₹${(currentPrice * 0.95).toFixed(2)} and resistance at ₹${(currentPrice * 1.05).toFixed(2)}.`;
  };

  const generateGeneralAnalysis = (symbol: string): string => {
    const currentPrice = Math.floor(Math.random() * 2000) + 500;
    const change = (Math.random() * 5 - 2.5).toFixed(2);
    const changePercent = (parseFloat(change) / currentPrice * 100).toFixed(2);
    const volume = (Math.random() * 10 + 1).toFixed(2);
    
    return `## Market Analysis for ${symbol}

• **Current Price**: ₹${currentPrice.toFixed(2)}
• **Change**: ${parseFloat(change) >= 0 ? '+' : ''}${change} (${parseFloat(changePercent) >= 0 ? '+' : ''}${changePercent}%)
• **Volume**: ${volume}M shares (${Math.random() > 0.5 ? 'Above' : 'Below'} average)
• **Market Sentiment**: ${['Bullish', 'Bearish', 'Neutral'][Math.floor(Math.random() * 3)]}

${symbol} is currently ${parseFloat(change) >= 0 ? 'trading higher' : 'trading lower'} with ${Math.random() > 0.5 ? 'strong' : 'moderate'} momentum. The overall market context is ${['favorable', 'challenging', 'mixed'][Math.floor(Math.random() * 3)]}.

Would you like me to provide more detailed technical analysis, fundamental insights, or a specific trade recommendation?`;
  };

  const generateMarketOverview = (): string => {
    const niftyChange = (Math.random() * 2 - 1).toFixed(2);
    const bankNiftyChange = (Math.random() * 2.5 - 1.2).toFixed(2);
    const vixValue = (Math.random() * 5 + 10).toFixed(2);
    
    return `## Market Overview

• **NIFTY 50**: ${parseFloat(niftyChange) >= 0 ? '+' : ''}${niftyChange}%
• **BANK NIFTY**: ${parseFloat(bankNiftyChange) >= 0 ? '+' : ''}${bankNiftyChange}%
• **INDIA VIX**: ${vixValue} (${parseFloat(vixValue) > 15 ? 'Elevated' : 'Low'} volatility)
• **Market Breadth**: ${Math.random() > 0.5 ? 'Positive' : 'Negative'} (${Math.floor(Math.random() * 500) + 1000} advances, ${Math.floor(Math.random() * 500) + 800} declines)
• **FII Activity**: ${Math.random() > 0.5 ? 'Net Buyers' : 'Net Sellers'}
• **DII Activity**: ${Math.random() > 0.5 ? 'Net Buyers' : 'Net Sellers'}

**Top Performing Sectors**:
1. ${['IT', 'Banking', 'Pharma', 'Auto', 'FMCG'][Math.floor(Math.random() * 5)]} (+${(Math.random() * 2 + 0.5).toFixed(2)}%)
2. ${['Energy', 'Metal', 'Realty', 'Media', 'Consumer Durables'][Math.floor(Math.random() * 5)]} (+${(Math.random() * 1.5 + 0.3).toFixed(2)}%)

**Underperforming Sectors**:
1. ${['Telecom', 'PSU Banks', 'Oil & Gas', 'Power', 'Capital Goods'][Math.floor(Math.random() * 5)]} (${(Math.random() * -2 - 0.5).toFixed(2)}%)

The market is showing ${Math.random() > 0.5 ? 'strength' : 'weakness'} with ${Math.random() > 0.5 ? 'positive' : 'mixed'} global cues. ${Math.random() > 0.5 ? 'Traders are advised to maintain a bullish bias.' : 'Caution is advised in the current market environment.'}`;
  };

  const generateTradingStrategy = (): string => {
    const strategies = [
      "## Momentum Trading Strategy\n\n• **Concept**: Capitalize on stocks showing strong price movement and volume\n• **Entry Criteria**:\n  - Stock up >2% with above-average volume\n  - RSI above 60 and rising\n  - MACD showing bullish crossover\n• **Exit Strategy**:\n  - Take profit at 5-8% gain\n  - Stop loss at 2-3% below entry\n  - Exit if RSI becomes overbought (>80)\n\nThis strategy works best in trending markets with clear sector rotation. Focus on stocks breaking out of consolidation patterns with institutional buying.",
      
      "## Breakout Trading Strategy\n\n• **Concept**: Enter trades when price breaks through significant resistance levels\n• **Entry Criteria**:\n  - Price breaks above key resistance with volume\n  - Wait for retest of breakout level\n  - Confirm with momentum indicators\n• **Exit Strategy**:\n  - Target: Distance equal to prior range\n  - Stop loss: Below the breakout level\n\nLook for stocks forming clear chart patterns like triangles, flags, or rectangles before the breakout. Higher time frame breakouts tend to be more reliable.",
      
      "## Gap Trading Strategy\n\n• **Concept**: Trade price gaps that occur between market sessions\n• **Entry Criteria**:\n  - Gap up/down >1.5% from previous close\n  - Volume at least 1.5x average\n  - First 30 minutes price action confirmation\n• **Exit Strategy**:\n  - For gap fills: Exit when price reaches previous close\n  - For gap continuations: Use trailing stop\n\nGap trading requires quick decision-making in the first hour of trading. Pre-market analysis and sector correlation assessment are crucial for success.",
      
      "## Mean Reversion Strategy\n\n• **Concept**: Trade the return to average price after extreme moves\n• **Entry Criteria**:\n  - Stock deviates >2 standard deviations from 20-day MA\n  - RSI reaches oversold (<30) or overbought (>70) levels\n  - Volume declining after extreme move\n• **Exit Strategy**:\n  - Take profit at mean (20-day MA)\n  - Stop loss if price continues in extreme direction\n\nThis strategy performs best in range-bound markets or on stocks with established trading ranges. Avoid using during earnings season or major news events."
    ];
    
    return strategies[Math.floor(Math.random() * strategies.length)];
  };

  // Format message content with markdown-like syntax
  const formatMessageContent = (content: string) => {
    // Replace ## Heading with styled heading
    content = content.replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold text-slate-200 mb-2">$1</h3>');
    
    // Replace bullet points
    content = content.replace(/^• (.*$)/gm, '<div class="flex items-start space-x-2 mb-1"><div class="w-1 h-1 bg-green-400 rounded-full mt-2"></div><div>$1</div></div>');
    
    // Replace nested bullet points
    content = content.replace(/^  - (.*$)/gm, '<div class="ml-4 flex items-start space-x-2 mb-1"><div class="w-1 h-1 bg-slate-400 rounded-full mt-2"></div><div>$1</div></div>');
    
    // Replace numbered lists
    content = content.replace(/^(\d+)\. (.*$)/gm, '<div class="flex items-start space-x-2 mb-1"><div class="text-green-400 font-medium">$1.</div><div>$2</div></div>');
    
    // Replace bold text
    content = content.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-slate-200">$1</span>');
    
    // Replace line breaks with <br>
    content = content.replace(/\n\n/g, '<br><br>');
    
    return content;
  };

  return (
    <div className="professional-card border border-slate-700/50 flex flex-col h-full">
      <div className="p-3 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-green-400" />
          <h2 className="text-base font-semibold text-slate-200 font-mono">AI TRADING ASSISTANT</h2>
        </div>
      </div>
      
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
                    <User className="w-4 h-4 text-white" />
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
      
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about any stock or trading strategy..."
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
        <div className="mt-2 text-xs text-slate-500 font-mono">
          Try: "Analyze RELIANCE" or "What's the market outlook today?"
        </div>
      </div>
    </div>
  );
};

export default AITradingAssistant;