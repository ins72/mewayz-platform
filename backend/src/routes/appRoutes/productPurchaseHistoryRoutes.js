const express = require('express');
const productPurchaseHistoryController = require('../../controllers/appControllers/productPurchaseHistoryController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(productPurchaseHistoryController.getAllProductPurchaseHistory)
  .post(productPurchaseHistoryController.createProductPurchaseHistory);

router
  .route('/:id')
  .get(productPurchaseHistoryController.getProductPurchaseHistory)
  .patch(productPurchaseHistoryController.updateProductPurchaseHistory)
  .delete(productPurchaseHistoryController.deleteProductPurchaseHistory);

router.route('/product/:productId').get(productPurchaseHistoryController.getPurchaseHistoryByProduct);
router.route('/customer/:customerId').get(productPurchaseHistoryController.getPurchaseHistoryByCustomer);
router.route('/stats').get(productPurchaseHistoryController.getPurchaseHistoryStats);

module.exports = router; 