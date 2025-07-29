const express = require('express');
const router = express.Router();
const performanceController = require('../../controllers/appControllers/performanceController');
const { authenticateToken, requireAdmin } = require('../../middlewares/authMiddleware');

// Performance metrics routes
router.get('/metrics', performanceController.getMetrics);
router.get('/overview', performanceController.getPerformanceOverview);
router.get('/metrics/:type', performanceController.getMetricsByType);
router.get('/trends', performanceController.getPerformanceTrends);

// Admin-only performance routes
router.post('/metrics', authenticateToken, requireAdmin, performanceController.createMetric);
router.put('/metrics/:id', authenticateToken, requireAdmin, performanceController.updateMetric);
router.delete('/metrics/:id', authenticateToken, requireAdmin, performanceController.deleteMetric);

module.exports = router; 