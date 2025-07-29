const express = require('express');
const transactionController = require('../../controllers/appControllers/transactionController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.get('/', transactionController.getAllTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransaction);

// Protected routes
router.use(authController.protect);

router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router; 