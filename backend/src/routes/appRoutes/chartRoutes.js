const express = require('express');
const chartController = require('../../controllers/appControllers/chartController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/public').get(chartController.getPublicCharts);
router.route('/type/:type').get(chartController.getChartByType);

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(chartController.getAllCharts)
  .post(chartController.createChart);

router
  .route('/:id')
  .get(chartController.getChart)
  .patch(chartController.updateChart)
  .delete(chartController.deleteChart);

router.route('/:id/data').patch(chartController.updateChartData);

module.exports = router; 