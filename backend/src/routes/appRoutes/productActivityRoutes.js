const express = require('express');
const productActivityController = require('../../controllers/appControllers/productActivityController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(productActivityController.getAllProductActivities)
  .post(productActivityController.createProductActivity);

router
  .route('/:id')
  .get(productActivityController.getProductActivity)
  .patch(productActivityController.updateProductActivity)
  .delete(productActivityController.deleteProductActivity);

router.route('/stats').get(productActivityController.getProductActivityStats);

module.exports = router; 