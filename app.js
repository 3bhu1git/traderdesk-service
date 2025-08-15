require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config/config');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');
const portfolioRoutes = require('./routes/portfolio');
const marketDataRoutes = require('./routes/marketData');
const brokerRoutes = require('./routes/broker');
const brokersRoutes = require('./routes/brokers');
const marketIntelligenceRoutes = require('./routes/marketIntelligence');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chartinkScreenerRoutes = require('./routes/chartinkScreener');
const WebSocketService = require('./services/websocket');
const CronService = require('./services/cron');
const { fetchHistoricalData } = require('./scripts/fetchHistoricalData');
const instrumentService = require('./services/instrumentService');

// Fallback logger if logger is undefined
if (!logger.requestLogger) {
    logger.requestLogger = (req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    };
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Global logger to debug all incoming requests
app.use((req, res, next) => {
  console.log(`[GLOBAL LOGGER] ${req.method} ${req.originalUrl}`);
  next();
});

// CORS middleware must be first
const allowedOrigins = require('./config/corsOrigins');
const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Dhan-Client-Id', 'x-client-id'],
    credentials: true
};
app.use(cors(corsOptions));

// Middleware
app.use('/api/chartink-proxy', express.text({ type: 'application/x-www-form-urlencoded' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.requestLogger);

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Request and response logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[LOG] Request: ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[LOG] Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route for health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Helper function to get CSRF token from Chartink
const getChartinkCSRFToken = async () => {
    try {
        console.log('Fetching Chartink screener page...');
        const response = await axios({
            method: 'GET',
            url: 'https://chartink.com/screener',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000
        });

        console.log('Chartink page response status:', response.status);
        console.log('Response data length:', response.data.length);

        // Extract CSRF token from HTML - try multiple patterns
        const html = response.data;
        let token = null;
        
        // Pattern 1: name="_token" value="..."
        let csrfMatch = html.match(/name="_token"[^>]*value="([^"]+)"/i);
        if (csrfMatch) {
            token = csrfMatch[1];
            console.log('Found CSRF token with pattern 1');
        }
        
        // Pattern 2: value="..." name="_token"
        if (!token) {
            csrfMatch = html.match(/value="([^"]+)"[^>]*name="_token"/i);
            if (csrfMatch) {
                token = csrfMatch[1];
                console.log('Found CSRF token with pattern 2');
            }
        }
        
        // Pattern 3: csrf-token meta tag
        if (!token) {
            csrfMatch = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/i);
            if (csrfMatch) {
                token = csrfMatch[1];
                console.log('Found CSRF token with pattern 3 (meta tag)');
            }
        }
        
        // Pattern 4: window.Laravel.csrfToken or similar
        if (!token) {
            csrfMatch = html.match(/['"_]token['"]?\s*[:=]\s*['"]([^'"]+)['"]/i);
            if (csrfMatch) {
                token = csrfMatch[1];
                console.log('Found CSRF token with pattern 4 (JS variable)');
            }
        }

        const cookies = response.headers['set-cookie'];
        console.log('Cookies found:', cookies ? cookies.length : 0);
        
        if (!token) {
            console.log('No CSRF token found. HTML sample:', html.substring(0, 500));
            // Try to find any input with "token" in the name
            const tokenInputs = html.match(/<input[^>]*token[^>]*>/gi);
            console.log('Token-related inputs found:', tokenInputs);
        }
        
        return {
            token,
            cookies: cookies ? cookies.join('; ') : null
        };
    } catch (error) {
        console.error('Failed to get CSRF token:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data sample:', error.response.data?.substring(0, 200));
        }
        return { token: null, cookies: null };
    }
};

// Chartink proxy route for CORS bypass
app.post('/api/chartink-proxy', async (req, res) => {
    try {
        console.log('Chartink proxy request received - raw body:', req.body);
        
        // Get the raw form data from request body
        const formData = req.body;
        
        if (!formData || typeof formData !== 'string') {
            console.log('No formData provided or empty');
            return res.status(400).json({ error: 'Form data is required' });
        }

        // Get CSRF token and cookies
        console.log('Fetching CSRF token from Chartink...');
        const { token, cookies } = await getChartinkCSRFToken();
        
        if (!token) {
            console.log('Failed to get CSRF token');
            return res.status(500).json({ error: 'Failed to get CSRF token from Chartink' });
        }

        console.log('CSRF token obtained:', token.substring(0, 10) + '...');

        // Add CSRF token to form data
        const formDataWithToken = `${formData}&_token=${encodeURIComponent(token)}`;
        console.log('Sending request to Chartink with CSRF token');

        const response = await axios({
            method: 'POST',
            url: 'https://chartink.com/screener/process',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://chartink.com/screener',
                'Origin': 'https://chartink.com',
                'Cookie': cookies || '',
                'X-Requested-With': 'XMLHttpRequest',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            data: formDataWithToken,
            timeout: 15000,
            validateStatus: function (status) {
                return status < 500; // Accept all status codes below 500
            }
        });

        console.log('Chartink response status:', response.status);
        console.log('Chartink response data sample:', JSON.stringify(response.data).substring(0, 200));

        res.json(response.data);
    } catch (error) {
        console.error('Chartink proxy error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        
        res.status(500).json({ 
            error: 'Failed to fetch from Chartink',
            message: error.response?.data || error.message,
            status: error.response?.status || 'unknown'
        });
    }
});

// Load Swagger documentation
const swaggerDocument = YAML.load(
    fs.readFileSync(path.join(__dirname, 'routes', 'swagger.yaml'), 'utf8')
);

// Set dynamic server URL in Swagger docs based on config
swaggerDocument.servers = [
    {
        url: `http://localhost:${config.app.port}`,
        description: 'Local Development Server'
    }
];

// Swagger UI route with custom options to include our auth script
const swaggerUiOptions = {
    customJs: '/js/swagger-auth.js',
    customCssUrl: null
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

// API routes
// console.log('apiRoutes:', apiRoutes, 'Type:', typeof apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/brokers', brokersRoutes);
app.use('/api/chartink-screeners', chartinkScreenerRoutes);
app.use('/api', apiRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/market', marketDataRoutes);
app.use('/api', brokerRoutes); // Mount broker routes at /api

// Catch-all route for SPA (React/Vite): serve index.html for unknown routes (except API/static)
app.get('*', (req, res, next) => {
    if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/public') ||
        req.path.startsWith('/api-docs') ||
        req.path.startsWith('/js')
    ) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'ui', 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server with MongoDB connection
const startServer = async () => {
    let cronService, wsService;
    
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Fetch historical data after successful connection
        try {
            await fetchHistoricalData();
            logger.info('Initial historical data fetch completed');
            
            // Load instrument data
            await instrumentService.loadInstruments();
            logger.info('Instrument data loaded successfully');
        } catch (error) {
            logger.error('Failed to fetch initial historical data:', error);
        }
        
        // Start the server
        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Swagger documentation available at http://localhost:${config.app.port}/api-docs`);

            // Only initialize services if access token is properly configured
            if (config.dhan.accessToken && config.dhan.accessToken !== 'your_access_token_here') {
                try {
                    // Initialize WebSocket service
                    wsService = WebSocketService.getInstance();
                    wsService.connect();

                    // Initialize Cron service
                    cronService = CronService.getInstance();
                    cronService.start();
                } catch (error) {
                    logger.error('Error initializing services', {
                        error: error.message,
                        stack: error.stack
                    });
                }
            } else {
                logger.warn('Running in development mode without WebSocket and Cron services (API credentials not configured)');
            }
        });

        // Graceful shutdown
        const shutdown = async () => {
            logger.info('Shutting down server...');

            try {
                // Safely stop services if they exist
                if (cronService && typeof cronService.stop === 'function') {
                    await cronService.stop();
                }
                if (wsService && typeof wsService.close === 'function') {
                    await wsService.close();
                }

                // Close HTTP server
                server.close(() => {
                    logger.info('HTTP server closed');
                    process.exit(0);
                });

                // Force close if graceful shutdown fails
                setTimeout(() => {
                    logger.error('Could not close connections in time, forcefully shutting down');
                    process.exit(1);
                }, 10000);
            } catch (error) {
                logger.error('Error during shutdown', {
                    error: error.message,
                    stack: error.stack
                });
                process.exit(1);
            }
        };

        // Handle process signals
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the application
startServer();

module.exports = app;