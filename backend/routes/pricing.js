const express = require('express');
const {
    getPricingPlans,
    getPricingPlan,
    createPricingPlan,
    updatePricingPlan,
    deletePricingPlan
} = require('../controllers/pricingController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getPricingPlans);
router.get('/:id', getPricingPlan);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .post(createPricingPlan);

router.route('/:id')
    .put(updatePricingPlan)
    .delete(deletePricingPlan);

module.exports = router; 
