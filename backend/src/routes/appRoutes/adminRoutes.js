const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/appControllers/adminController');
const { authenticateToken, requireAdmin } = require('../../middlewares/authMiddleware');

// Admin Dashboard Routes - Only using available methods
router.get('/dashboard', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/database/stats', authenticateToken, requireAdmin, adminController.getDatabaseStats);
router.get('/content/overview', authenticateToken, requireAdmin, adminController.getContentOverview);

// Placeholder routes for future implementation
router.get('/system-health', authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'System health endpoint - to be implemented' });
});

router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Users endpoint - to be implemented' });
});

module.exports = router; 