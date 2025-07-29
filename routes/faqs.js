const express = require('express');
const router = express.Router();
const {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  searchFAQs,
  addFAQItem,
  updateFAQItem,
  deleteFAQItem,
  addFAQItemView,
  markFAQItemHelpful,
  markFAQItemNotHelpful,
  getFAQStats
} = require('../controllers/faqController');

// Public routes
router.route('/')
  .get(getFAQs);

router.route('/search')
  .get(searchFAQs);

router.route('/stats')
  .get(getFAQStats);

router.route('/:id')
  .get(getFAQ);

// FAQ item interaction routes (public)
router.route('/:id/items/:itemId/view')
  .post(addFAQItemView);

router.route('/:id/items/:itemId/helpful')
  .post(markFAQItemHelpful);

router.route('/:id/items/:itemId/not-helpful')
  .post(markFAQItemNotHelpful);

// Admin routes (protected)
router.route('/')
  .post(createFAQ);

router.route('/:id')
  .put(updateFAQ)
  .delete(deleteFAQ);

router.route('/:id/items')
  .post(addFAQItem);

router.route('/:id/items/:itemId')
  .put(updateFAQItem)
  .delete(deleteFAQItem);

module.exports = router; 