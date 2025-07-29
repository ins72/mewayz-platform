const express = require('express');
const {
    getFaqs,
    getFaq,
    createFaq,
    updateFaq,
    deleteFaq,
    searchFaqs
} = require('../controllers/faqController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getFaqs);
router.get('/search', searchFaqs);
router.get('/:id', getFaq);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .post(createFaq);

router.route('/:id')
    .put(updateFaq)
    .delete(deleteFaq);

module.exports = router; 
