const express = require('express');
const productTrafficSourceController = require('../../controllers/appControllers/productTrafficSourceController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(productTrafficSourceController.getAllProductTrafficSources)
  .post(productTrafficSourceController.createProductTrafficSource);

router
  .route('/:id')
  .get(productTrafficSourceController.getProductTrafficSource)
  .patch(productTrafficSourceController.updateProductTrafficSource)
  .delete(productTrafficSourceController.deleteProductTrafficSource);

router.route('/product/:productId').get(productTrafficSourceController.getProductTrafficSourcesByProduct);
router.route('/stats').get(productTrafficSourceController.getProductTrafficSourceStats);

module.exports = router; 