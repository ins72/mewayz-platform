const express = require('express');
const router = express.Router();
const {
  getPricingPlans,
  getPricingPlan,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  getRecommendedPlan,
  getPlanByTitle,
  comparePricingPlans
} = require('../controllers/pricingController');

// Public routes
router.route('/')
  .get(getPricingPlans);

router.route('/recommended')
  .get(getRecommendedPlan);

router.route('/compare')
  .get(comparePricingPlans);

router.route('/title/:title')
  .get(getPlanByTitle);

router.route('/:id')
  .get(getPricingPlan);

// Admin routes (protected)
router.route('/')
  .post(createPricingPlan);

router.route('/:id')
  .put(updatePricingPlan)
  .delete(deletePricingPlan);

module.exports = router; 