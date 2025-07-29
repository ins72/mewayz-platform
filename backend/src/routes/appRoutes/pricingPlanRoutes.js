const express = require('express');
const pricingPlanController = require('../../controllers/appControllers/pricingPlanController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/active').get(pricingPlanController.getActivePricingPlans);
router.route('/popular').get(pricingPlanController.getPopularPlan);

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(pricingPlanController.getAllPricingPlans)
  .post(pricingPlanController.createPricingPlan);

router
  .route('/:id')
  .get(pricingPlanController.getPricingPlan)
  .patch(pricingPlanController.updatePricingPlan)
  .delete(pricingPlanController.deletePricingPlan);

module.exports = router; 