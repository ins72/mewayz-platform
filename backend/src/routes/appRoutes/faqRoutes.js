const express = require('express');
const faqController = require('../../controllers/appControllers/faqController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/active').get(faqController.getActiveFAQs);
router.route('/search').get(faqController.searchFAQs);

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(faqController.getAllFAQs)
  .post(faqController.createFAQ);

router
  .route('/:id')
  .get(faqController.getFAQ)
  .patch(faqController.updateFAQ)
  .delete(faqController.deleteFAQ);

module.exports = router; 