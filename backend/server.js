const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { webSocketManager } = require('./middleware/websocket');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/database');

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const products = require('./routes/products');
const customers = require('./routes/customers');
const orders = require('./routes/orders');
const leads = require('./routes/leads');
const pricing = require('./routes/pricing');
const faqs = require('./routes/faqs');
const analytics = require('./routes/analytics');
const public = require('./routes/public');
const organizations = require('./routes/organizations');
const courses = require('./routes/courses');
const creators = require('./routes/creators');
const shopItems = require('./routes/shop-items');
const knowledgeBaseRoutes = require('./routes/knowledge-base');
const supportTicketRoutes = require('./routes/support-tickets');

// Enterprise and Advanced Feature Routes
const aiContent = require('./routes/aiContent');
const enterprise = require('./routes/enterprise');
const businessIntelligence = require('./routes/businessIntelligence');
const designStudio = require('./routes/designStudio');
const crossPlatform = require('./routes/crossPlatform');
const creatorMonetization = require('./routes/creatorMonetization');
const financialServices = require('./routes/financialServices');
const globalExpansion = require('./routes/globalExpansion');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Compression
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/products', products);
app.use('/api/v1/customers', customers);
app.use('/api/v1/orders', orders);
app.use('/api/v1/leads', leads);
app.use('/api/v1/pricing', pricing);
app.use('/api/v1/faqs', faqs);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/public', public);
app.use('/api/v1/organizations', organizations);
app.use('/api/v1/courses', courses);
app.use('/api/v1/creators', creators);
app.use('/api/v1/shop-items', shopItems);
app.use('/api/v1/knowledge-base', knowledgeBaseRoutes);
app.use('/api/v1/support-tickets', supportTicketRoutes);

// Enterprise and Advanced Feature Routes
app.use('/api/v1/ai-content', aiContent);
app.use('/api/v1/enterprise', enterprise);
app.use('/api/v1/business-intelligence', businessIntelligence);
app.use('/api/v1/design-studio', designStudio);
app.use('/api/v1/cross-platform', crossPlatform);
app.use('/api/v1/creator-monetization', creatorMonetization);
app.use('/api/v1/financial-services', financialServices);
app.use('/api/v1/global-expansion', globalExpansion);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Initialize WebSocket server
    webSocketManager.initialize(server);
    console.log(`WebSocket server initialized on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close WebSocket server first, then HTTP server & exit process
    webSocketManager.shutdown();
    server.close(() => process.exit(1));
});

// Handle SIGTERM and SIGINT for graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    webSocketManager.shutdown();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    webSocketManager.shutdown();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

module.exports = app; 