const express = require('express');
const affiliateController = require('../../controllers/appControllers/affiliateController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/code/:code').get(affiliateController.getAffiliateByCode);
router.route('/top').get(affiliateController.getTopAffiliates);

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(affiliateController.getAllAffiliates)
  .post(affiliateController.createAffiliate);

router
  .route('/:id')
  .get(affiliateController.getAffiliate)
  .patch(affiliateController.updateAffiliate)
  .delete(affiliateController.deleteAffiliate);

router.route('/:id/insights').get(affiliateController.getAffiliateInsights);
router.route('/:id/earnings').patch(affiliateController.updateAffiliateEarnings);

module.exports = router; 