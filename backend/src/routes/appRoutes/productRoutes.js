const express = require('express');
const router = express.Router();
const productController = require('../../controllers/appControllers/productController');
const createAuthMiddleware = require('../../controllers/middlewaresControllers/createAuthMiddleware');
const User = require('../../models/appModels/User');

const { isValidAuthToken } = createAuthMiddleware(User);

// Product routes
router.get('/products', isValidAuthToken, productController.listAll);
router.get('/products/popular', isValidAuthToken, productController.getPopular);
router.get('/products/:id', isValidAuthToken, productController.read);
router.post('/products', isValidAuthToken, productController.create);
router.put('/products/:id', isValidAuthToken, productController.update);
router.delete('/products/:id', isValidAuthToken, productController.remove);

module.exports = router; 