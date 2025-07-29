const express = require('express');
const router = express.Router();
const ShopItem = require('../models/ShopItem');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/v1/shop-items
 * @desc    Get all shop items with filters and search
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { 
      status: 'published', 
      isActive: true 
    };
    
    // Add filters
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.creator) {
      filter.creatorId = req.query.creator;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.featured) {
      filter.isFeatured = req.query.featured === 'true';
    }
    if (req.query.software) {
      filter.software = { $in: [req.query.software] };
    }

    // Build sort object
    const sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'popular':
          sort.salesCount = -1;
          sort.viewCount = -1;
          break;
        case 'newest':
          sort.publishedAt = -1;
          break;
        case 'oldest':
          sort.publishedAt = 1;
          break;
        case 'price_low':
          sort.price = 1;
          break;
        case 'price_high':
          sort.price = -1;
          break;
        case 'rating':
          sort.rating = -1;
          sort.reviewCount = -1;
          break;
        default:
          sort.isFeatured = -1;
          sort.salesCount = -1;
      }
    } else {
      sort.isFeatured = -1;
      sort.salesCount = -1;
    }

    // Search functionality
    let shopItems;
    let total;

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
      sort.score = { $meta: 'textScore' };
      
      [shopItems, total] = await Promise.all([
        ShopItem.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('creatorId', 'login avatar stats isVerified')
          .exec(),
        ShopItem.countDocuments(filter)
      ]);
    } else {
      [shopItems, total] = await Promise.all([
        ShopItem.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('creatorId', 'login avatar stats isVerified')
          .exec(),
        ShopItem.countDocuments(filter)
      ]);
    }

    // Transform data for frontend compatibility
    const transformedItems = shopItems.map(item => ({
      id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      rating: item.rating,
      category: item.category,
      salesCount: item.salesCount,
      reviewCount: item.reviewCount,
      discountPercentage: item.discountPercentage,
      creator: item.creatorId,
      isFeatured: item.isFeatured,
      tags: item.tags,
      formattedPrice: item.formattedPrice
    }));

    res.status(200).json({
      success: true,
      count: shopItems.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      data: transformedItems
    });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/shop-items/featured
 * @desc    Get featured shop items
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const shopItems = await ShopItem.getFeatured(limit);
    
    const transformedItems = shopItems.map(item => ({
      id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      rating: item.rating,
      category: item.category,
      salesCount: item.salesCount,
      reviewCount: item.reviewCount,
      discountPercentage: item.discountPercentage,
      creator: item.creatorId,
      formattedPrice: item.formattedPrice
    }));

    res.status(200).json({
      success: true,
      count: shopItems.length,
      data: transformedItems
    });
  } catch (error) {
    console.error('Error fetching featured shop items:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/shop-items/popular
 * @desc    Get popular shop items
 * @access  Public
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const shopItems = await ShopItem.getPopular(limit);
    
    const transformedItems = shopItems.map(item => ({
      id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      rating: item.rating,
      category: item.category,
      salesCount: item.salesCount,
      reviewCount: item.reviewCount,
      discountPercentage: item.discountPercentage,
      creator: item.creatorId,
      formattedPrice: item.formattedPrice
    }));

    res.status(200).json({
      success: true,
      count: shopItems.length,
      data: transformedItems
    });
  } catch (error) {
    console.error('Error fetching popular shop items:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/shop-items/:id
 * @desc    Get single shop item
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const shopItem = await ShopItem.findById(req.params.id)
      .populate('creatorId', 'login avatar stats isVerified bio socials')
      .exec();

    if (!shopItem) {
      return res.status(404).json({
        success: false,
        error: 'Shop item not found'
      });
    }

    // Update view count
    await shopItem.updateAnalytics('impressions');

    const transformedItem = {
      id: shopItem._id,
      name: shopItem.name,
      description: shopItem.description,
      price: shopItem.price,
      originalPrice: shopItem.originalPrice,
      image: shopItem.image,
      images: shopItem.images,
      rating: shopItem.rating,
      category: shopItem.category,
      subcategory: shopItem.subcategory,
      tags: shopItem.tags,
      salesCount: shopItem.salesCount,
      reviewCount: shopItem.reviewCount,
      viewCount: shopItem.viewCount,
      downloadCount: shopItem.downloadCount,
      discountPercentage: shopItem.discountPercentage,
      creator: shopItem.creatorId,
      isFeatured: shopItem.isFeatured,
      isPromoted: shopItem.isPromoted,
      fileSize: shopItem.fileSize,
      fileFormat: shopItem.fileFormat,
      license: shopItem.license,
      software: shopItem.software,
      compatibility: shopItem.compatibility,
      dimensions: shopItem.dimensions,
      colors: shopItem.colors,
      fonts: shopItem.fonts,
      downloadFiles: shopItem.downloadFiles,
      formattedPrice: shopItem.formattedPrice,
      publishedAt: shopItem.publishedAt,
      createdAt: shopItem.createdAt
    };

    res.status(200).json({
      success: true,
      data: transformedItem
    });
  } catch (error) {
    console.error('Error fetching shop item:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Shop item not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/shop-items
 * @desc    Create new shop item
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      images,
      category,
      subcategory,
      tags,
      fileSize,
      fileFormat,
      license,
      software,
      compatibility,
      dimensions,
      colors,
      fonts,
      downloadFiles,
      seo
    } = req.body;

    const shopItem = await ShopItem.create({
      name,
      description,
      price,
      originalPrice,
      image,
      images,
      category,
      subcategory,
      tags,
      fileSize,
      fileFormat,
      license,
      software,
      compatibility,
      dimensions,
      colors,
      fonts,
      downloadFiles,
      seo,
      creatorId: req.user.id,
      organizationId: req.user.organizationId
    });

    const populatedItem = await ShopItem.findById(shopItem._id)
      .populate('creatorId', 'login avatar stats');

    res.status(201).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    console.error('Error creating shop item:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   PUT /api/v1/shop-items/:id
 * @desc    Update shop item
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let shopItem = await ShopItem.findById(req.params.id);

    if (!shopItem) {
      return res.status(404).json({
        success: false,
        error: 'Shop item not found'
      });
    }

    // Check ownership or admin
    if (shopItem.creatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this shop item'
      });
    }

    const updateFields = [
      'name', 'description', 'price', 'originalPrice', 'image', 'images',
      'category', 'subcategory', 'tags', 'fileSize', 'fileFormat', 'license',
      'software', 'compatibility', 'dimensions', 'colors', 'fonts', 
      'downloadFiles', 'seo'
    ];
    
    const updates = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Only admin can update these fields
    if (req.user.role === 'admin') {
      const adminFields = ['status', 'isFeatured', 'isPromoted', 'isActive'];
      adminFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }

    shopItem = await ShopItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('creatorId', 'login avatar stats');

    res.status(200).json({
      success: true,
      data: shopItem
    });
  } catch (error) {
    console.error('Error updating shop item:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   DELETE /api/v1/shop-items/:id
 * @desc    Delete shop item
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const shopItem = await ShopItem.findById(req.params.id);

    if (!shopItem) {
      return res.status(404).json({
        success: false,
        error: 'Shop item not found'
      });
    }

    // Check ownership or admin
    if (shopItem.creatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this shop item'
      });
    }

    await shopItem.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/shop-items/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await ShopItem.distinct('category', { 
      status: 'published', 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router; 
