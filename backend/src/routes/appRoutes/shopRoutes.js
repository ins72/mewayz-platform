const express = require('express');
const shopController = require('../../controllers/appControllers/shopController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/cart', shopController.addToCart);
router.get('/cart', shopController.getCart);
router.delete('/cart/:productId', shopController.removeFromCart);
router.post('/checkout', shopController.checkout);

module.exports = router; 