const express = require('express');
const analyticsController = require('../../controllers/appControllers/analyticsController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Dashboard statistics
router.get('/dashboard', analyticsController.getDashboardStats);

// Client analytics
router.get('/client/:clientId', analyticsController.getClientAnalytics);

// Revenue trends
router.get('/revenue-trends', analyticsController.getRevenueTrends);

// Invoice trends
router.get('/invoice-trends', analyticsController.getInvoiceTrends);

// Top clients by revenue
router.get('/top-clients', analyticsController.getTopClients);

// Payment status distribution
router.get('/payment-distribution', analyticsController.getPaymentStatusDistribution);

module.exports = router; 