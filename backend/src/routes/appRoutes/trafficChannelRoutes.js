const express = require('express');
const trafficChannelController = require('../../controllers/appControllers/trafficChannelController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(trafficChannelController.getAllTrafficChannels)
  .post(trafficChannelController.createTrafficChannel);

router
  .route('/:id')
  .get(trafficChannelController.getTrafficChannel)
  .patch(trafficChannelController.updateTrafficChannel)
  .delete(trafficChannelController.deleteTrafficChannel);

router.route('/stats').get(trafficChannelController.getTrafficChannelStats);
router.route('/data').get(trafficChannelController.getTrafficChannelData);

module.exports = router; 