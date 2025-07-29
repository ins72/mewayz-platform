const express = require('express');
const refundController = require('../../controllers/appControllers/refundController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(refundController.getAllRefunds)
  .post(refundController.createRefund);

router
  .route('/:id')
  .get(refundController.getRefund)
  .patch(refundController.updateRefund)
  .delete(refundController.deleteRefund);

router.route('/stats').get(refundController.getRefundStats);

module.exports = router; 