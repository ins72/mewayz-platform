const express = require('express');
const compatibilityController = require('../../controllers/appControllers/compatibilityController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/active').get(compatibilityController.getActiveCompatibilities);
router.route('/category/:category').get(compatibilityController.getCompatibilitiesByCategory);
router.route('/product/:productId').get(compatibilityController.getProductCompatibilities);

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(compatibilityController.getAllCompatibilities)
  .post(compatibilityController.createCompatibility);

router
  .route('/:id')
  .get(compatibilityController.getCompatibility)
  .patch(compatibilityController.updateCompatibility)
  .delete(compatibilityController.deleteCompatibility);

module.exports = router; 