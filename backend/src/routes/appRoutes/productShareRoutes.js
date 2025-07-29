const express = require('express');
const productShareController = require('../../controllers/appControllers/productShareController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(productShareController.getAllProductShares)
  .post(productShareController.createProductShare);

router
  .route('/:id')
  .get(productShareController.getProductShare)
  .patch(productShareController.updateProductShare)
  .delete(productShareController.deleteProductShare);

router.route('/product/:productId').get(productShareController.getProductSharesByProduct);
router.route('/stats').get(productShareController.getProductShareStats);

module.exports = router; 