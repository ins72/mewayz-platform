const express = require('express');
const shopItemController = require('../../controllers/appControllers/shopItemController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/featured').get(shopItemController.getFeaturedItems);
router.route('/search').get(shopItemController.searchShopItems);
router.route('/categories').get(shopItemController.getCategories);
router.route('/tags').get(shopItemController.getTags);

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(shopItemController.getAllShopItems)
  .post(shopItemController.createShopItem);

router
  .route('/:id')
  .get(shopItemController.getShopItem)
  .patch(shopItemController.updateShopItem)
  .delete(shopItemController.deleteShopItem);

module.exports = router; 