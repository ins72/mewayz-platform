const express = require('express');
const incomeController = require('../../controllers/appControllers/incomeController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(incomeController.getAllIncome)
  .post(incomeController.createIncome);

router
  .route('/:id')
  .get(incomeController.getIncome)
  .patch(incomeController.updateIncome)
  .delete(incomeController.deleteIncome);

router.route('/stats').get(incomeController.getIncomeStats);

module.exports = router; 