const express = require('express');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Public routes (for authenticated users)
router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/stats')
    .get(getOrderStats);

router.route('/:id')
    .get(getOrder)
    .put(updateOrder)
    .delete(authorize('admin', 'moderator'), deleteOrder);

module.exports = router; 
