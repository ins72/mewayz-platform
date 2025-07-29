const express = require('express');
const insightController = require('../../controllers/appControllers/insightController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.get('/', insightController.getAllInsights);
router.get('/product/:productId', insightController.getProductInsights);

// Protected routes
router.use(authController.protect);

router.get('/affiliate', insightController.getAffiliateInsights);
router.get('/dashboard', insightController.getDashboardInsights);
router.post('/', insightController.createInsight);
router.put('/:id', insightController.updateInsight);
router.delete('/:id', insightController.deleteInsight);

module.exports = router; 