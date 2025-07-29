const express = require('express');
const {
    getAnalytics,
    getDashboardStats,
    getRealTimeMetrics,
    getUserActivities,
    getSalesAnalytics,
    getCustomerAnalytics,
    getProductAnalytics,
    getOrderAnalytics,
    getLeadAnalytics,
    exportAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

// Use enterprise authentication middleware
const { authenticate, requireActive } = require('../middleware/enterpriseAuth');

router.use(authenticate);
router.use(requireActive);

// Analytics routes
router.get('/', getAnalytics);
router.get('/dashboard', getDashboardStats);
router.get('/real-time-metrics', getRealTimeMetrics);
router.get('/user-activities', getUserActivities);
router.get('/sales', getSalesAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/products', getProductAnalytics);
router.get('/orders', getOrderAnalytics);
router.get('/leads', getLeadAnalytics);
router.get('/export', exportAnalytics);

module.exports = router; 
