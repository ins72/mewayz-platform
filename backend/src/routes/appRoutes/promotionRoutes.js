const express = require('express');
const promotionController = require('../../controllers/appControllers/promotionController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/', promotionController.uploadPromotionImage, promotionController.resizePromotionImage, promotionController.createPromotion);
router.put('/:promotionId', promotionController.updatePromotion);
router.delete('/:promotionId', promotionController.deletePromotion);
router.post('/:promotionId/schedule', promotionController.schedulePromotion);
router.post('/:promotionId/publish', promotionController.publishPromotion);

module.exports = router; 