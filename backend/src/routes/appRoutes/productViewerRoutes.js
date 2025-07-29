const express = require('express');
const productViewController = require('../../controllers/appControllers/productViewController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(productViewController.getAllProductViewers)
  .post(productViewController.createProductViewer);

router
  .route('/:id')
  .get(productViewController.getProductViewer)
  .patch(productViewController.updateProductViewer)
  .delete(productViewController.deleteProductViewer);

router.route('/product/:productId').get(productViewController.getProductViewersByProduct);
router.route('/stats').get(productViewController.getProductViewerStats);

module.exports = router; 