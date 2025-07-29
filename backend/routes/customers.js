const express = require('express');
const {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats
} = require('../controllers/customerController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Public routes (for authenticated users)
router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.route('/stats')
    .get(getCustomerStats);

router.route('/:id')
    .get(getCustomer)
    .put(updateCustomer)
    .delete(authorize('admin', 'moderator'), deleteCustomer);

module.exports = router; 
