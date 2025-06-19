import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Users, Search, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'user' | 'admin';
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isOnline: boolean;
  lastSeen: Date;
  isAdmin: boolean;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { users, admin } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock chat users (combine regular users and admin)
  const chatUsers: ChatUser[] = [
    // Admin user
    ...(admin ? [{
      id: 'admin',
      name: 'Admin Support',
      email: 'admin@traderdesk.ai',
      isOnline: true,
      lastSeen: new Date(),
      isAdmin: true
    }] : []),
    // Regular users
    ...users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isOnline: Math.random() > 0.5, // Random online status for demo
      lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      isAdmin: false
    }))
  ];

  // Mock messages
  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: 'admin',
      senderName: 'Admin Support',
      receiverId: user?.id || '',
      receiverName: user?.name || '',
      content: 'Welcome to TraderDesk.ai! How can I help you today?',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true,
      type: 'admin'
    },
    {
      id: '2',
      senderId: user?.id || '',
      senderName: user?.name || '',
      receiverId: 'admin',
      receiverName: 'Admin Support',
      content: 'Hi, I have a question about the premium features.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      type: 'user'
    },
    {
      id: '3',
      senderId: 'admin',
      senderName: 'Admin Support',
      receiverId: user?.id || '',
      receiverName: user?.name || '',
      content: 'Sure! I\'d be happy to help you with premium features. What specific feature are you interested in?',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      isRead: true,
      type: 'admin'
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
    // Auto-select admin for first conversation
    if (chatUsers.length > 0) {
      const adminUser = chatUsers.find(u => u.isAdmin);
      if (adminUser) {
        setSelectedUser(adminUser);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredUsers = chatUsers.filter(chatUser => 
    chatUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chatUser.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversationMessages = (userId: string) => {
    return messages.filter(msg => 
      (msg.senderId === user?.id && msg.receiverId === userId) ||
      (msg.senderId === userId && msg.receiverId === user?.id)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedUser || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      receiverId: selectedUser.id,
      receiverName: selectedUser.name,
      content: inputMessage,
      timestamp: new Date(),
      isRead: false,
      type: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simulate response from admin/user after 2 seconds
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedUser.id,
        senderName: selectedUser.name,
        receiverId: user.id,
        receiverName: user.name,
        content: selectedUser.isAdmin 
          ? "Thank you for your message. I'll get back to you shortly with the information you need."
          : "Thanks for reaching out! I'll respond as soon as I can.",
        timestamp: new Date(),
        isRead: false,
        type: selectedUser.isAdmin ? 'admin' : 'user'
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="h-full flex bg-slate-950">
      {/* Users List */}
      <div className="w-80 border-r border-slate-700/50 bg-slate-900/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-slate-200 font-mono mb-3">MESSAGES</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm font-mono"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto professional-scroll">
          {filteredUsers.map((chatUser) => {
            const conversationMessages = getConversationMessages(chatUser.id);
            const lastMessage = conversationMessages[conversationMessages.length - 1];
            const unreadCount = conversationMessages.filter(msg => !msg.isRead && msg.senderId === chatUser.id).length;

            return (
              <div
                key={chatUser.id}
                onClick={() => setSelectedUser(chatUser)}
                className={`p-4 border-b border-slate-800/50 cursor-pointer transition-all duration-200 hover:bg-slate-800/30 ${
                  selectedUser?.id === chatUser.id ? 'bg-slate-800/50 border-l-2 border-l-cyan-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      chatUser.isAdmin 
                        ? 'bg-gradient-to-br from-orange-600 to-red-600' 
                        : 'bg-gradient-to-br from-purple-600 to-indigo-600'
                    }`}>
                      {chatUser.isAdmin ? (
                        <Users className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    {chatUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-200 truncate font-mono">
                        {chatUser.name}
                        {chatUser.isAdmin && <span className="text-orange-400 ml-1">(Admin)</span>}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1 font-mono">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-slate-400 font-mono">
                        {chatUser.isOnline ? 'Online' : formatTime(chatUser.lastSeen)}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-slate-500 truncate mt-1 font-mono">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedUser.isAdmin 
                        ? 'bg-gradient-to-br from-orange-600 to-red-600' 
                        : 'bg-gradient-to-br from-purple-600 to-indigo-600'
                    }`}>
                      {selectedUser.isAdmin ? (
                        <Users className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    {selectedUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 font-mono">
                      {selectedUser.name}
                      {selectedUser.isAdmin && <span className="text-orange-400 ml-1">(Admin)</span>}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400 font-mono">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{selectedUser.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-sm text-xs font-mono ${
                    selectedUser.isOnline 
                      ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                  }`}>
                    {selectedUser.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 professional-scroll">
              {getConversationMessages(selectedUser.id).map((message) => (
                <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${message.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        message.senderId === user?.id
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                          : message.type === 'admin'
                          ? 'bg-gradient-to-br from-orange-600 to-red-600'
                          : 'bg-gradient-to-br from-cyan-600 to-blue-600'
                      }`}>
                        {message.senderId === user?.id ? (
                          <User className="w-4 h-4 text-white" />
                        ) : message.type === 'admin' ? (
                          <Users className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.senderId === user?.id ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                            : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                        }`}>
                          <div className="text-sm font-mono">{message.content}</div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-slate-500 font-mono">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.senderId === user?.id && (
                            <div className="flex items-center">
                              {message.isRead ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Clock className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedUser.name}...`}
                    className="w-full p-3 bg-slate-800/60 border border-slate-600/50 rounded-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none font-mono text-sm"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-sm hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 font-mono">Select a conversation</h3>
              <p className="text-slate-500 font-mono">Choose a user to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;