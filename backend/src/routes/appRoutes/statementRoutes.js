const express = require('express');
const statementController = require('../../controllers/appControllers/statementController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(statementController.getAllStatements)
  .post(statementController.createStatement);

router
  .route('/:id')
  .get(statementController.getStatement)
  .patch(statementController.updateStatement)
  .delete(statementController.deleteStatement);

router.route('/stats').get(statementController.getStatementStats);

module.exports = router; 