const express = require('express');
const payoutController = require('../../controllers/appControllers/payoutController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(payoutController.getAllPayouts)
  .post(payoutController.createPayout);

router
  .route('/:id')
  .get(payoutController.getPayout)
  .patch(payoutController.updatePayout)
  .delete(payoutController.deletePayout);

router.route('/stats').get(payoutController.getPayoutStats);

module.exports = router; 