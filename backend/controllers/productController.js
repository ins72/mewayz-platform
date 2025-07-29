const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments();

    let query = Product.find({ status: 'published' });

    // Search functionality
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = query.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } }
            ]
        });
    }

    // Filter by category
    if (req.query.category) {
        query = query.find({ category: req.query.category });
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
        const priceFilter = {};
        if (req.query.minPrice) priceFilter.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) priceFilter.$lte = parseFloat(req.query.maxPrice);
        query = query.find({ price: priceFilter });
    }

    // Filter by creator (for user's own products)
    if (req.query.creator) {
        query = query.find({ creator: req.query.creator });
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',');
        const sortOrder = {};
        sortBy.forEach(item => {
            if (item.startsWith('-')) {
                sortOrder[item.substring(1)] = -1;
            } else {
                sortOrder[item] = 1;
            }
        });
        query = query.sort(sortOrder);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    query = query.skip(startIndex).limit(limit);

    // Populate category and creator
    query = query.populate('category', 'name').populate('creator', 'name email');

    // Execute query
    const products = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products
    });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name')
        .populate('creator', 'name email profile');

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    // Update view count
    await product.updateAnalytics('view');

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private
const createProduct = asyncHandler(async (req, res, next) => {
    // Add creator to request body
    req.body.creator = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        data: product
    });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    // Make sure user is product creator or admin
    if (product.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to update this product'
        });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('category', 'name').populate('creator', 'name email');

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    // Make sure user is product creator or admin
    if (product.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to delete this product'
        });
    }

    await product.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 6;
    
    const products = await Product.findFeatured()
        .limit(limit)
        .populate('category', 'name')
        .populate('creator', 'name email');

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Get products by category
// @route   GET /api/v1/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const products = await Product.findByCategory(req.params.categoryId)
        .skip(startIndex)
        .limit(limit)
        .populate('category', 'name')
        .populate('creator', 'name email');

    const total = await Product.countDocuments({ 
        category: req.params.categoryId, 
        status: 'published' 
    });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products
    });
});

// @desc    Search products
// @route   GET /api/v1/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res, next) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({
            success: false,
            error: 'Search query is required'
        });
    }

    const products = await Product.search(q)
        .populate('category', 'name')
        .populate('creator', 'name email')
        .limit(20);

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Get user's products
// @route   GET /api/v1/products/my
// @access  Private
const getMyProducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments({ creator: req.user.id });

    const products = await Product.find({ creator: req.user.id })
        .skip(startIndex)
        .limit(limit)
        .populate('category', 'name')
        .sort('-createdAt');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products
    });
});

// @desc    Get product statistics (Admin only)
// @route   GET /api/v1/products/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res, next) => {
    const stats = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                publishedProducts: {
                    $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                },
                draftProducts: {
                    $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                },
                featuredProducts: {
                    $sum: { $cond: ['$featured', 1, 0] }
                },
                totalRevenue: { $sum: '$analytics.revenue' },
                totalViews: { $sum: '$analytics.views' },
                totalSales: { $sum: '$analytics.sales' }
            }
        }
    ]);

    const categoryStats = await Product.aggregate([
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        },
        {
            $unwind: '$categoryInfo'
        },
        {
            $group: {
                _id: '$categoryInfo.name',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    const topProducts = await Product.find()
        .sort({ 'analytics.revenue': -1 })
        .limit(10)
        .populate('creator', 'name email')
        .select('name price analytics.revenue analytics.sales analytics.views');

    res.status(200).json({
        success: true,
        data: {
            overview: stats[0] || {
                totalProducts: 0,
                publishedProducts: 0,
                draftProducts: 0,
                featuredProducts: 0,
                totalRevenue: 0,
                totalViews: 0,
                totalSales: 0
            },
            categoryStats,
            topProducts
        }
    });
});

module.exports = {
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
}; 