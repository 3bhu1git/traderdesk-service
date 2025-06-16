# Dhan Market App

## Overview
The Dhan Market App is a comprehensive Node.js application designed to interact with the Dhan API for live market data, order management, and portfolio tracking. It provides real-time updates and historical data for NSE Equity and F&O, allowing users to manage their trading activities efficiently with robust security features and data persistence.

## Features

### Market Data
- **Live Price Streaming**: Real-time market data via WebSocket
- **Historical Data**: OHLC data with customizable timeframes
- **Backtest Support**: Historical data with technical indicators
- **Symbol Support**: NSE Equity and F&O instruments

### Order Management
- **Order Types**: LIMIT, MARKET, SL, SL-M orders
- **Order Operations**: Place, modify, and cancel orders
- **Status Tracking**: Real-time order status updates
- **Order History**: Comprehensive order tracking with filters

### Portfolio Management
- **Holdings**: Track delivery positions with current value
- **Positions**: Monitor intraday positions with MTM
- **Portfolio Summary**: Total value and P&L tracking
- **Symbol Analysis**: Combined position and holding views

### Data Storage & Sync
- **MongoDB Integration**: Store market data and user data
- **Auto Sync**: Daily updates for key market symbols
- **Redis Caching**: Optional caching for performance
- **Data Persistence**: Reliable storage with indexes

### Security & Performance
- **API Authentication**: Secure key and token management
- **Rate Limiting**: Protect against abuse
- **Input Validation**: Request validation with Joi
- **Comprehensive Logging**: Debug and audit support

## Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Redis (optional)
- Dhan API credentials

## Project Structure
```
dhan-market-app/
├── config/         # Environment and API configuration
├── routes/         # API route definitions
├── controllers/    # Request handlers
├── services/       # Business logic and API integration
├── models/         # MongoDB schemas
├── middleware/     # Security and validation middleware
├── sockets/        # WebSocket handlers
├── cron/          # Scheduled jobs
├── utils/         # Helper functions and logging
└── app.js         # Application entry point
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dhan-market-app.git
   cd dhan-market-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the config directory:
   ```env
   # App
   PORT=3000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/dhan-market-app

   # Redis (optional)
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Dhan API
   DHAN_API_KEY=your_api_key
   DHAN_ACCESS_TOKEN=your_access_token
   DHAN_CLIENT_ID=your_client_id
   ```

4. Start the application:
   - Development: `npm run dev`
   - Production: `npm start`
   - Testing: `npm test`
   - Linting: `npm run lint`

## API Endpoints

### Market Data
- `GET /api/live-price/:symbol`
  - Stream real-time price updates via SSE
  - Query params: none

- `GET /api/historical-data/:symbol`
  - Fetch OHLC data
  - Query params: timeframe, from_date, to_date

### Orders
- `POST /api/place-order`
  ```json
  {
    "symbol": "RELIANCE",
    "quantity": 10,
    "transactionType": "BUY",
    "orderType": "LIMIT",
    "productType": "CNC",
    "price": 2800
  }
  ```

- `PUT /api/modify-order/:orderId`
- `DELETE /api/cancel-order/:orderId`
- `GET /api/order-status/:orderId`

### Portfolio
- `GET /api/holdings`
- `GET /api/positions`
- `GET /api/portfolio/summary`
- `GET /api/portfolio/symbol/:symbol`

## API Documentation
Access the Swagger UI at `http://localhost:3000/api-docs` for interactive API documentation.

## Error Handling
- All endpoints return appropriate HTTP status codes
- Error responses include descriptive messages
- Validation errors list all invalid fields

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.