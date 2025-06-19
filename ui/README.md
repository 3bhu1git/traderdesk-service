# TraderDesk.ai - Professional Trading Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./VERSION.md)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-green.svg)](https://supabase.com/)

A comprehensive, professional-grade trading platform with advanced market intelligence, real-time data analysis, and institutional-quality tools for serious traders and investors.

## 🚀 Features

### 📊 Market Intelligence
- **Real-time Market Overview** - Live indices, market breadth, and sentiment analysis
- **Sector Analysis** - Comprehensive sector performance with strength indicators
- **FII/DII Flow Tracking** - Institutional money flow analysis with visual charts
- **Sector Rotation Matrix** - Advanced quadrant-based sector rotation analysis

### 🔍 Trading Tools
- **Advanced Stock Screener** - Multi-category screening (Long-term, IPO, F&O, Short-term)
- **Premium Indicators** - AI-powered technical indicators with high accuracy rates
- **Professional Trading Desk** - Live charts, option chain analysis, and VIX monitoring
- **Performance Analytics** - Comprehensive trade tracking and performance metrics

### 💬 Communication
- **Real-time Chat System** - User-to-admin messaging with read receipts
- **System Notifications** - Market alerts and system updates
- **Support Integration** - Built-in customer support workflow

### 🔐 Security & Authentication
- **Multi-factor Authentication** - Phone OTP and Google OAuth
- **Session Management** - Secure single-device authentication
- **Role-based Access** - User and admin role management
- **Database Security** - Row-level security policies

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Real-time, Authentication)
- **Charts:** TradingView Widgets, Recharts
- **UI Components:** Custom professional components with Lucide React icons
- **Animations:** Framer Motion
- **Build Tool:** Vite
- **Styling:** Professional terminal-inspired dark theme

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd traderdesk-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The application uses Supabase with the following key tables:
- `fii_dii_data` - FII/DII flow data
- `sector_data` - Sector performance metrics
- User management tables (handled by Supabase Auth)

Run the migration files in the `supabase/migrations` directory to set up the database schema.

## 🏷️ Version Management

This project includes a comprehensive version control system:

### Create Version Tag
```bash
npm run version:tag
```
Creates a complete backup of the current codebase with metadata.

### List All Versions
```bash
npm run version:list
```
Shows all available versions with details and status.

### Revert to Previous Version
```bash
npm run version:revert
```
Interactive tool to safely revert to any previous version.

## 🚀 Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

3. **Deploy to your preferred platform**
   - Vercel, Netlify, or any static hosting service
   - Ensure environment variables are configured

## 📱 Mobile Support

The application is fully responsive with:
- Touch-optimized interactions
- Mobile-friendly navigation
- Adaptive chart sizing
- Optimized performance for mobile devices

## 🎨 Design System

### Theme
- **Professional Dark Theme** - Terminal-inspired design
- **Monospace Typography** - Professional trading aesthetic
- **Consistent Color Palette** - Semantic color system
- **Micro-interactions** - Smooth animations and transitions

### Components
- Reusable professional components
- Consistent spacing and typography
- Accessible design patterns
- Mobile-first responsive design

## 🔧 Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Consistent component structure
- Professional naming conventions

### Version Control
- Create version tags before major changes
- Document all modifications
- Test thoroughly before deployment
- Maintain rollback capabilities

### Performance
- Optimized bundle size
- Lazy loading for routes
- Efficient re-renders
- Mobile performance optimization

## 📊 Features Overview

### Dashboard
- Real-time portfolio metrics
- Market overview widgets
- Quick action modules
- Professional status indicators

### Market Intelligence
- Live market data integration
- Institutional flow analysis
- Sector performance tracking
- Advanced rotation matrix

### Trading Tools
- Multi-category stock screening
- Technical indicator suite
- Live chart integration
- Performance analytics

### User Management
- Secure authentication flow
- Profile management
- Subscription handling
- Session security

## 🤝 Contributing

This is a production application with strict change management:

1. **Small Changes Only** - Only incremental improvements allowed
2. **Version Before Changes** - Always create version tags
3. **Test Thoroughly** - Ensure all features work
4. **Document Changes** - Update VERSION.md

## 📄 License

This project is proprietary software for TraderDesk.ai.

## 📞 Support

For technical support or questions:
- Check the documentation in `/docs`
- Review version history in `VERSION.md`
- Use the built-in chat system for user support

---

**Current Version:** 1.0.0 - Complete professional trading platform
**Last Updated:** December 13, 2024
**Status:** Production Ready ✅