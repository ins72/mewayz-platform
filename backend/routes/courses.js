const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { requireMFA } = require('../middleware/mfa');

/**
 * @route   GET /api/v1/courses
 * @desc    Get all courses with filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true, status: 'published' };
    
    // Add filters
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.difficulty) {
      filter.difficultyLevel = req.query.difficulty;
    }
    if (req.query.language) {
      filter.language = req.query.language;
    }
    if (req.query.instructor) {
      filter.instructorId = req.query.instructor;
    }
    if (req.query.organization) {
      filter.organizationId = req.query.organization;
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    if (req.query.price) {
      if (req.query.price === 'free') {
        filter.price = 0;
      } else if (req.query.price === 'paid') {
        filter.price = { $gt: 0 };
      }
    }

    const sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'oldest':
          sort.createdAt = 1;
          break;
        case 'popular':
          sort.enrollmentCount = -1;
          break;
        case 'rating':
          sort['rating.average'] = -1;
          break;
        case 'price-low':
          sort.price = 1;
          break;
        case 'price-high':
          sort.price = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('instructorId', 'firstName lastName email avatar')
      .populate('organizationId', 'name logoUrl');

    const total = await Course.countDocuments(filter);

    // Get categories for filter
    const categories = await Course.distinct('category', { isPublished: true, status: 'published' });

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        difficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/courses/featured
 * @desc    Get featured courses
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const courses = await Course.find({ 
      isFeatured: true, 
      isPublished: true, 
      status: 'published' 
    })
    .sort({ enrollmentCount: -1 })
    .limit(limit)
    .populate('instructorId', 'firstName lastName email avatar')
    .populate('organizationId', 'name logoUrl');

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/courses/:slug
 * @desc    Get course by slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ 
      slug: req.params.slug,
      isPublished: true,
      status: 'published'
    })
    .populate('instructorId', 'firstName lastName email avatar bio')
    .populate('organizationId', 'name logoUrl website');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Increment view count
    course.analytics.totalViews += 1;
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/courses
 * @desc    Create new course
 * @access  Private
 */
router.post('/', auth.protect, requireMFA, async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      originalPrice,
      currency,
      thumbnailUrl,
      previewVideoUrl,
      difficultyLevel,
      estimatedDuration,
      category,
      subcategory,
      tags,
      language,
      prerequisites,
      learningObjectives,
      targetAudience,
      materials,
      settings,
      seo
    } = req.body;

    // Check if slug already exists
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'Course with this title already exists'
      });
    }

    const course = new Course({
      title,
      description,
      shortDescription,
      price,
      originalPrice,
      currency,
      thumbnailUrl,
      previewVideoUrl,
      difficultyLevel,
      estimatedDuration,
      category,
      subcategory,
      tags,
      language,
      prerequisites,
      learningObjectives,
      targetAudience,
      materials,
      settings,
      seo,
      instructorId: req.user.id,
      organizationId: req.user.organizationId
    });

    await course.save();

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
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
 * @route   PUT /api/v1/courses/:id
 * @desc    Update course
 * @access  Private
 */
router.put('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this course'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
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
 * @route   DELETE /api/v1/courses/:id
 * @desc    Delete course
 * @access  Private
 */
router.delete('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this course'
      });
    }

    await course.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/courses/:id/publish
 * @desc    Publish course
 * @access  Private
 */
router.post('/:id/publish', auth.protect, requireMFA, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to publish this course'
      });
    }

    course.isPublished = true;
    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/courses/:id/unpublish
 * @desc    Unpublish course
 * @access  Private
 */
router.post('/:id/unpublish', auth.protect, requireMFA, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to unpublish this course'
      });
    }

    course.isPublished = false;
    course.status = 'draft';
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/courses/:id/rate
 * @desc    Rate course
 * @access  Private
 */
router.post('/:id/rate', auth.protect, async (req, res) => {
  try {
    const { rating } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    await course.updateRating(rating);

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/courses/instructor/:instructorId
 * @desc    Get courses by instructor
 * @access  Public
 */
router.get('/instructor/:instructorId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ 
      instructorId: req.params.instructorId,
      isPublished: true,
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('organizationId', 'name logoUrl');

    const total = await Course.countDocuments({ 
      instructorId: req.params.instructorId,
      isPublished: true,
      status: 'published'
    });

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/courses/category/:category
 * @desc    Get courses by category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const courses = await Course.findByCategory(req.params.category)
    .sort({ enrollmentCount: -1 })
    .skip(skip)
    .limit(limit)
    .populate('instructorId', 'firstName lastName email avatar')
    .populate('organizationId', 'name logoUrl');

    const total = await Course.countDocuments({ 
      category: req.params.category,
      isPublished: true,
      status: 'published'
    });

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router; 
