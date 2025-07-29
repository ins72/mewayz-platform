const cluster = require('cluster');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Load production configuration
const productionConfig = require('./config/production');

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    './logs',
    './uploads',
    './backups',
    './ssl'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
};

// Setup graceful shutdown
const setupGracefulShutdown = (server) => {
  const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        console.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('✅ HTTP server closed.');
      
      // Close database connections
      const mongoose = require('mongoose');
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
      });
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('❌ Forcing shutdown after 30 seconds...');
      process.exit(1);
    }, 30000);
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
};

// Worker process
const startWorker = () => {
  try {
    console.log(`🚀 Starting worker process ${process.pid}...`);
    
    // Create directories
    createDirectories();
    
    // Load the main server
    const app = require('./server');
    
    const PORT = productionConfig.PORT;
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Worker ${process.pid} - MEWAYZ Production Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${productionConfig.NODE_ENV}`);
      console.log(`📊 MongoDB: ${productionConfig.MONGODB_URI}`);
      console.log(`🔒 Security: Enhanced production settings active`);
    });
    
    // Configure server timeouts
    server.keepAliveTimeout = productionConfig.PERFORMANCE.keepAliveTimeout;
    server.headersTimeout = productionConfig.PERFORMANCE.headersTimeout;
    
    // Setup graceful shutdown
    setupGracefulShutdown(server);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      const mongoose = require('mongoose');
      const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      };
      
      res.status(200).json(healthStatus);
    });
    
    // Metrics endpoint (if enabled)
    if (productionConfig.MONITORING.enabled) {
      app.get('/metrics', (req, res) => {
        const metrics = {
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          pid: process.pid,
          version: process.version,
          platform: process.platform
        };
        
        res.status(200).json(metrics);
      });
    }
    
  } catch (error) {
    console.error('❌ Error starting worker:', error);
    process.exit(1);
  }
};

// Master process
const startMaster = () => {
  const numWorkers = productionConfig.PERFORMANCE.workers;
  
  console.log('🚀 MEWAYZ Production Server Starting...');
  console.log(`📊 Environment: ${productionConfig.NODE_ENV}`);
  console.log(`🔧 CPU Cores: ${os.cpus().length}`);
  console.log(`👥 Workers: ${numWorkers}`);
  console.log(`🐂 Clustering: ${productionConfig.PERFORMANCE.cluster ? 'Enabled' : 'Disabled'}`);
  
  // Create worker processes
  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();
    console.log(`👷 Worker ${worker.process.pid} started`);
  }
  
  // Handle worker death
  cluster.on('exit', (worker, code, signal) => {
    console.log(`💀 Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    
    // Restart worker
    const newWorker = cluster.fork();
    console.log(`👷 New worker ${newWorker.process.pid} started`);
  });
  
  // Handle master process shutdown
  process.on('SIGTERM', () => {
    console.log('🔄 Master received SIGTERM. Shutting down workers...');
    
    Object.keys(cluster.workers).forEach(id => {
      cluster.workers[id].kill();
    });
  });
  
  console.log('✅ Master process ready. Workers starting...');
};

// Performance monitoring
const logPerformanceMetrics = () => {
  const usage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  console.log('📊 Performance Metrics:');
  console.log(`   Memory Usage: ${Math.round(usage.rss / 1024 / 1024)} MB`);
  console.log(`   Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);
  console.log(`   Uptime: ${Math.round(process.uptime())} seconds`);
};

// Start the application
if (productionConfig.PERFORMANCE.cluster && cluster.isMaster) {
  startMaster();
  
  // Log performance metrics every 5 minutes
  setInterval(logPerformanceMetrics, 5 * 60 * 1000);
} else {
  startWorker();
}

module.exports = {}; 