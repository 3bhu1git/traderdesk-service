const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Starting TraderDesk API Server...');
console.log(`📍 Binding to ${HOST}:${PORT}`);

// Start services
try {
  const screenerScheduler = require('./services/screenerScheduler');
  screenerScheduler.start();
  console.log('✅ Screener scheduler started');
} catch (error) {
  console.log('⚠️  Screener scheduler not available:', error.message);
}

const server = app.listen(PORT, HOST, () => {
  const address = server.address();
  console.log(`
🚀 TraderDesk API Server is running successfully!
📍 Server Address: ${address.address}:${address.port}
📊 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Documentation: http://localhost:${PORT}/api-docs

🎯 Available API Endpoints:
   GET  /health                      - Health check
   GET  /api                         - API information
   GET  /api-docs                    - Swagger documentation
   
   🔐 Authentication:
   POST /api/auth/send-otp           - Send OTP
   POST /api/auth/verify-otp         - Verify OTP & login
   GET  /api/auth/profile            - Get user profile
   
   📊 Screener Management:
   GET  /api/admin/screeners         - List screeners
   POST /api/admin/screeners         - Create screener
   GET  /api/admin/screeners/stats   - Get statistics
   POST /api/admin/screeners/test-chartink - Test connection

📖 Interactive API Testing: http://localhost:${PORT}/api-docs
📁 Documentation: See /context/ directory for project docs
  `);
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Server failed to start:');
  
  if (error.code === 'EADDRINUSE') {
    console.error(`📍 Port ${PORT} is already in use!`);
    console.error('🔧 Solutions:');
    console.error('   1. Kill existing process: pkill -f "node server.js"');
    console.error('   2. Use different port: PORT=3001 node server.js');
    console.error('   3. Check what\'s using the port: lsof -i :3000');
  } else if (error.code === 'EACCES') {
    console.error(`📍 Permission denied for port ${PORT}`);
    console.error('🔧 Try using a port > 1024 or run with sudo');
  } else {
    console.error('📍 Server error:', error.message);
  }
  
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;
    console.log(`   📁 /api/routes/: ${routeLocations['api/routes']} routes`);
    console.log(`   📁 /routes/: ${routeLocations.routes} routes`);
    console.log(`   📁 Inline in app.js: ${routeLocations.inline} routes`);
    console.log('\n❌ PROBLEM: Routes are scattered across multiple locations!');
    console.log('✅ SOLUTION: Consolidate all routes into /api/routes/ directory');
  }, 1000);
});

// Enhanced error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('🔧 Solutions:');
    console.error('   1. Kill existing process: pkill -f "node server.js"');
    console.error('   2. Use different port: PORT=3001 node server.js');
    console.error('   3. Check what\'s using the port: lsof -i :3000');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;
    testHttp('/api/admin/screeners');
    
  }, 2000);
});

// Enhanced error handling
server.on('error', (error) => {
  console.error('❌ Server failed to start:');
  
  if (error.code === 'EADDRINUSE') {
    console.error(`📍 Port ${PORT} is already in use!`);
    console.error('🔧 Solutions:');
    console.error('   1. Kill existing process: pkill -f "node server.js"');
    console.error('   2. Use different port: PORT=3001 node server.js');
    console.error('   3. Check what\'s using the port: lsof -i :3000');
  } else if (error.code === 'EACCES') {
    console.error(`📍 Permission denied for port ${PORT}`);
    console.error('🔧 Try using a port > 1024 or run with sudo');
  } else {
    console.error('📍 Server error:', error.message);
  }
  
  process.exit(1);
});

server.on('listening', () => {
  console.log(`🎯 Server is now listening for connections...`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;
