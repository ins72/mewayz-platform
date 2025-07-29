const express = require('express');
const router = express.Router();
const Creator = require('../models/Creator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/v1/creators
 * @desc    Get all creators with filters and search
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    // Add filters
    if (req.query.specialty) {
      filter.specialties = { $in: [req.query.specialty] };
    }
    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }
    if (req.query.online) {
      filter.isOnline = req.query.online === 'true';
    }
    if (req.query.verified) {
      filter.isVerified = req.query.verified === 'true';
    }
    if (req.query.plan) {
      filter.plan = req.query.plan;
    }

    // Build sort object
    const sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'popular':
          sort['stats.rating'] = -1;
          sort['stats.followers'] = -1;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'oldest':
          sort.createdAt = 1;
          break;
        case 'rating':
          sort['stats.rating'] = -1;
          break;
        case 'followers':
          sort['stats.followers'] = -1;
          break;
        default:
          sort.featured = -1;
          sort['stats.rating'] = -1;
      }
    } else {
      sort.featured = -1;
      sort['stats.rating'] = -1;
    }

    // Search functionality
    let creators;
    let total;

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
      sort.score = { $meta: 'textScore' };
      
      [creators, total] = await Promise.all([
        Creator.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email avatar')
          .populate('organizationId', 'name logo')
          .exec(),
        Creator.countDocuments(filter)
      ]);
    } else {
      [creators, total] = await Promise.all([
        Creator.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email avatar')
          .populate('organizationId', 'name logo')
          .exec(),
        Creator.countDocuments(filter)
      ]);
    }

    // Transform data for frontend compatibility
    const transformedCreators = creators.map(creator => ({
      id: creator._id,
      login: creator.login,
      details: creator.details,
      avatar: creator.avatar,
      isOnline: creator.isOnline,
      label: creator.label,
      tags: creator.tags,
      time: creator.timeAgo,
      shop: creator.shop,
      socials: creator.socials,
      stats: creator.stats,
      specialties: creator.specialties,
      plan: creator.plan,
      isVerified: creator.isVerified,
      featured: creator.featured,
      user: creator.userId,
      organization: creator.organizationId
    }));

    res.status(200).json({
      success: true,
      count: creators.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      data: transformedCreators
    });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/creators/featured
 * @desc    Get featured creators
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const creators = await Creator.getFeatured(limit);
    
    const transformedCreators = creators.map(creator => ({
      id: creator._id,
      login: creator.login,
      details: creator.details,
      avatar: creator.avatar,
      isOnline: creator.isOnline,
      label: creator.label,
      tags: creator.tags,
      time: creator.timeAgo,
      shop: creator.shop,
      socials: creator.socials,
      stats: creator.stats,
      specialties: creator.specialties,
      user: creator.userId
    }));

    res.status(200).json({
      success: true,
      count: creators.length,
      data: transformedCreators
    });
  } catch (error) {
    console.error('Error fetching featured creators:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/creators/:id
 * @desc    Get single creator
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id)
      .populate('userId', 'name email avatar')
      .populate('organizationId', 'name logo')
      .exec();

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'Creator not found'
      });
    }

    const transformedCreator = {
      id: creator._id,
      login: creator.login,
      details: creator.details,
      avatar: creator.avatar,
      isOnline: creator.isOnline,
      label: creator.label,
      tags: creator.tags,
      time: creator.timeAgo,
      shop: creator.shop,
      socials: creator.socials,
      stats: creator.stats,
      specialties: creator.specialties,
      bio: creator.bio,
      location: creator.location,
      plan: creator.plan,
      isVerified: creator.isVerified,
      featured: creator.featured,
      user: creator.userId,
      organization: creator.organizationId,
      createdAt: creator.createdAt
    };

    res.status(200).json({
      success: true,
      data: transformedCreator
    });
  } catch (error) {
    console.error('Error fetching creator:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Creator not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/creators
 * @desc    Create new creator profile
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      login,
      details,
      avatar,
      label,
      tags,
      socials,
      specialties,
      bio,
      location
    } = req.body;

    // Check if login already exists
    const existingCreator = await Creator.findOne({ login });
    if (existingCreator) {
      return res.status(400).json({
        success: false,
        error: 'Login already exists'
      });
    }

    const creator = await Creator.create({
      login,
      details,
      avatar,
      label,
      tags,
      socials,
      specialties,
      bio,
      location,
      userId: req.user.id,
      organizationId: req.user.organizationId
    });

    const populatedCreator = await Creator.findById(creator._id)
      .populate('userId', 'name email avatar')
      .populate('organizationId', 'name logo');

    res.status(201).json({
      success: true,
      data: populatedCreator
    });
  } catch (error) {
    console.error('Error creating creator:', error);
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
 * @route   PUT /api/v1/creators/:id
 * @desc    Update creator profile
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let creator = await Creator.findById(req.params.id);

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'Creator not found'
      });
    }

    // Check ownership or admin
    if (creator.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this creator profile'
      });
    }

    const updateFields = [
      'details', 'avatar', 'label', 'tags', 'socials', 
      'specialties', 'bio', 'location'
    ];
    
    const updates = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Only admin can update these fields
    if (req.user.role === 'admin') {
      const adminFields = ['featured', 'isVerified', 'plan', 'isActive'];
      adminFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }

    creator = await Creator.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar')
     .populate('organizationId', 'name logo');

    res.status(200).json({
      success: true,
      data: creator
    });
  } catch (error) {
    console.error('Error updating creator:', error);
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
 * @route   DELETE /api/v1/creators/:id
 * @desc    Delete creator profile
 * @access  Private
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id);

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'Creator not found'
      });
    }

    await creator.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting creator:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   PUT /api/v1/creators/:id/online-status
 * @desc    Update creator online status
 * @access  Private
 */
router.put('/:id/online-status', protect, async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id);

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'Creator not found'
      });
    }

    // Check ownership
    if (creator.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await creator.updateOnlineStatus();

    res.status(200).json({
      success: true,
      data: { isOnline: creator.isOnline, lastActiveTime: creator.lastActiveTime }
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   PUT /api/v1/creators/:id/stats
 * @desc    Update creator stats
 * @access  Private
 */
router.put('/:id/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id);

    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'Creator not found'
      });
    }

    await creator.updateStats();

    res.status(200).json({
      success: true,
      data: { stats: creator.stats }
    });
  } catch (error) {
    console.error('Error updating creator stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router; 
