const production = {
  // Environment Configuration
  NODE_ENV: 'production',
  PORT: process.env.PORT || 5000,
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mewayz_production',
  DB_OPTIONS: {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'MEWAYZProduction2024SecureJWTSecretKeyForProductionEnvironment',
  JWT_EXPIRE: '30d',
  
  // Frontend Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://mewayz.com',
  
  // Security Configuration
  BCRYPT_ROUNDS: 14,
  SESSION_SECRET: process.env.SESSION_SECRET || 'MEWAYZProductionSessionSecretKey2024',
  
  // CORS Configuration
  CORS: {
    origin: [
      'https://mewayz.com',
      'https://www.mewayz.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // File Upload Configuration
  UPLOAD: {
    path: './uploads',
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  },
  
  // Logging Configuration
  LOGGING: {
    level: 'info',
    file: './logs/production.log',
    maxSize: '10m',
    maxFiles: '7d',
    format: 'combined'
  },
  
  // Performance Configuration
  PERFORMANCE: {
    cluster: true,
    workers: require('os').cpus().length,
    keepAliveTimeout: 65000,
    headersTimeout: 66000,
    compression: true,
    trustProxy: true
  },
  
  // Email Configuration
  EMAIL: {
    server: process.env.EMAIL_SERVER || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'noreply@mewayz.com',
      pass: process.env.EMAIL_PASS
    }
  },
  
  // Redis Configuration (for caching and sessions)
  REDIS: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true
  },
  
  // SSL Configuration
  SSL: {
    enabled: false, // Set to true when SSL certificates are available
    certPath: process.env.SSL_CERT_PATH || './ssl/cert.pem',
    keyPath: process.env.SSL_KEY_PATH || './ssl/key.pem'
  },
  
  // API Configuration
  API: {
    version: 'v1',
    prefix: '/api',
    timeout: 30000
  },
  
  // Health Check Configuration
  HEALTH_CHECK: {
    enabled: true,
    endpoint: '/health',
    interval: 30000
  },
  
  // Backup Configuration
  BACKUP: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retentionDays: 30,
    path: './backups'
  },
  
  // Monitoring Configuration
  MONITORING: {
    enabled: true,
    metricsPort: 9090,
    healthPort: 8080
  },
  
  // Feature Flags
  FEATURES: {
    enableSwagger: false,
    enableDebugRoutes: false,
    enableMetrics: true,
    enableCaching: true,
    enableCluster: true
  }
};

module.exports = production; 