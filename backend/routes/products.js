const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductsByCategory,
    searchProducts,
    getMyProducts,
    getProductStats
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);

// Protected routes
router.use(protect);

router.get('/my', getMyProducts);

router.route('/')
    .post(createProduct);

router.route('/:id')
    .put(updateProduct)
    .delete(deleteProduct);

// Admin only routes
router.get('/stats', authorize('admin'), getProductStats);

module.exports = router; 
