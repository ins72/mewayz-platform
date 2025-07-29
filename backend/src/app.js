const express = require('express');

const cors = require('cors');
const compression = require('compression');

const cookieParser = require('cookie-parser');

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');
const analyticsRouter = require('./routes/appRoutes/analyticsRoutes');
const productRouter = require('./routes/appRoutes/productRoutes');
const transactionRouter = require('./routes/appRoutes/transactionRoutes');
const messageRouter = require('./routes/appRoutes/messageRoutes');
const notificationRouter = require('./routes/appRoutes/notificationRoutes');
const commentRouter = require('./routes/appRoutes/commentRoutes');
const refundRouter = require('./routes/appRoutes/refundRoutes');
const payoutRouter = require('./routes/appRoutes/payoutRoutes');
const incomeRouter = require('./routes/appRoutes/incomeRoutes');
const statementRouter = require('./routes/appRoutes/statementRoutes');
const faqRouter = require('./routes/appRoutes/faqRoutes');
const creatorRouter = require('./routes/appRoutes/creatorRoutes');
const shopItemRouter = require('./routes/appRoutes/shopItemRoutes');
const pricingPlanRouter = require('./routes/appRoutes/pricingPlanRoutes');
const followerRouter = require('./routes/appRoutes/followerRoutes');
const countryRouter = require('./routes/appRoutes/countryRoutes');
const activeTimeRouter = require('./routes/appRoutes/activeTimeRoutes');
const chartRouter = require('./routes/appRoutes/chartRoutes');
const compatibilityRouter = require('./routes/appRoutes/compatibilityRoutes');
const promotionRouter = require('./routes/appRoutes/promotionRoutes');
const affiliateRouter = require('./routes/appRoutes/affiliateRoutes');
const insightRouter = require('./routes/appRoutes/insightRoutes');
const productActivityRouter = require('./routes/appRoutes/productActivityRoutes');
const trafficChannelRouter = require('./routes/appRoutes/trafficChannelRoutes');
const deviceAnalyticsRouter = require('./routes/appRoutes/deviceAnalyticsRoutes');
const productViewerRouter = require('./routes/appRoutes/productViewerRoutes');
const productTrafficSourceRouter = require('./routes/appRoutes/productTrafficSourceRoutes');
const productShareRouter = require('./routes/appRoutes/productShareRoutes');
const productPurchaseHistoryRouter = require('./routes/appRoutes/productPurchaseHistoryRoutes');
const productDraftRouter = require('./routes/appRoutes/productDraftRoutes');
const authRouter = require('./routes/appRoutes/authRoutes');
const userRouter = require('./routes/appRoutes/userRoutes');
const shopRouter = require('./routes/appRoutes/shopRoutes');
const followerRoutes = require('./routes/appRoutes/followerRoutes');
const promotionRoutes = require('./routes/appRoutes/promotionRoutes');
const blogRouter = require('../routes/blog');
const securityRouter = require('./routes/appRoutes/securityRoutes');
const aiContentRouterApp = require('./routes/appRoutes/aiContentRoutes');
const workflowRouter = require('./routes/appRoutes/workflowRoutes');

// Import new competitive advantage routes
const aiContentRouter = require('../routes/aiContent');
const creatorMonetizationRouter = require('../routes/creatorMonetization');
const crossPlatformRouter = require('../routes/crossPlatform');
const designStudioRouter = require('../routes/designStudio');
const businessIntelligenceRouter = require('../routes/businessIntelligence');
const financialServicesRouter = require('../routes/financialServices');
const globalExpansionRouter = require('../routes/globalExpansion');
const enterpriseRouter = require('../routes/enterprise');

const app = express();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//         SECURITY MIDDLEWARE
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// app.use(helmet());

app.use(compression());

// Enable CORS for all routes
app.use(cors({
  origin: (origin, callback) => {
    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    // If no origin (e.g., mobile apps, Postman), allow it
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent with the request
}));

app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//         API ROUTES
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Use the root routes
app.use('/api/', coreAuthRouter);
app.use('/api/', coreApiRouter);
app.use('/api/', coreDownloadRouter);
app.use('/api/', corePublicRouter);
app.use('/api/', erpApiRouter);

app.use('/api/analytics', analyticsRouter);
app.use('/api/product', productRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/message', messageRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/comment', commentRouter);
app.use('/api/refund', refundRouter);
app.use('/api/payout', payoutRouter);
app.use('/api/income', incomeRouter);
app.use('/api/statement', statementRouter);
app.use('/api/faq', faqRouter);
app.use('/api/creator', creatorRouter);
app.use('/api/shop-item', shopItemRouter);
app.use('/api/pricing-plan', pricingPlanRouter);
app.use('/api/follower', followerRouter);
app.use('/api/country', countryRouter);
app.use('/api/active-time', activeTimeRouter);
app.use('/api/chart', chartRouter);
app.use('/api/compatibility', compatibilityRouter);
app.use('/api/promotion', promotionRouter);
app.use('/api/affiliate', affiliateRouter);
app.use('/api/insight', insightRouter);
app.use('/api/product-activity', productActivityRouter);
app.use('/api/traffic-channel', trafficChannelRouter);
app.use('/api/device-analytics', deviceAnalyticsRouter);
app.use('/api/product-viewer', productViewerRouter);
app.use('/api/product-traffic-source', productTrafficSourceRouter);
app.use('/api/product-share', productShareRouter);
app.use('/api/product-purchase-history', productPurchaseHistoryRouter);
app.use('/api/product-draft', productDraftRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/shop', shopRouter);
app.use('/api/follower', followerRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/blog', blogRouter);
app.use('/api/security', securityRouter);
app.use('/api/ai-content-app', aiContentRouterApp);
app.use('/api/workflow', workflowRouter);

// Competitive Advantage API Routes
app.use('/api/ai', aiContentRouter);
app.use('/api/monetization', creatorMonetizationRouter);
app.use('/api/cross-platform', crossPlatformRouter);
app.use('/api/design', designStudioRouter);
app.use('/api/business-intelligence', businessIntelligenceRouter);
app.use('/api/financial', financialServicesRouter);
app.use('/api/global', globalExpansionRouter);
app.use('/api/enterprise', enterpriseRouter);

// ErrorHandlers middleware that catch all routes
app.use(errorHandlers.notFound);
app.use(errorHandlers.developmentErrors);

module.exports = app;
