const express = require('express');
const deviceAnalyticsController = require('../../controllers/appControllers/deviceAnalyticsController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(deviceAnalyticsController.getAllDeviceAnalytics)
  .post(deviceAnalyticsController.createDeviceAnalytics);

router
  .route('/:id')
  .get(deviceAnalyticsController.getDeviceAnalytics)
  .patch(deviceAnalyticsController.updateDeviceAnalytics)
  .delete(deviceAnalyticsController.deleteDeviceAnalytics);

router.route('/devices').get(deviceAnalyticsController.getDeviceData);
router.route('/gender').get(deviceAnalyticsController.getGenderData);
router.route('/stats').get(deviceAnalyticsController.getDeviceAnalyticsStats);

module.exports = router; 