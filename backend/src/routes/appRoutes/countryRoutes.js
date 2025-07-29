const express = require('express');
const countryController = require('../../controllers/appControllers/countryController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/analytics').get(countryController.getCountriesAnalytics);
router.route('/earnings').get(countryController.getCountriesEarnings);

// Protect all routes after this middleware
router.use(authController.protect);

// Restrict to admin only
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(countryController.getAllCountries)
  .post(countryController.createCountry);

router
  .route('/:id')
  .get(countryController.getCountry)
  .patch(countryController.updateCountry)
  .delete(countryController.deleteCountry);

module.exports = router; 