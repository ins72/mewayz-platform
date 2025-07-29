const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats,
    getUserAnalytics,
    bulkUpdateUsers,
    bulkDeleteUsers
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/stats')
    .get(getUserStats);

router.route('/analytics')
    .get(getUserAnalytics);

router.route('/bulk')
    .put(bulkUpdateUsers)
    .delete(bulkDeleteUsers);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router; 
