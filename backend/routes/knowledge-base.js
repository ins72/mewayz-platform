const express = require('express');
const router = express.Router();
const KnowledgeBase = require('../models/KnowledgeBase');
const auth = require('../middleware/auth');
const { requireMFA } = require('../middleware/mfa');

/**
 * @route   GET /api/v1/knowledge-base
 * @desc    Get all knowledge base articles with filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };
    
    // Add filters
    if (req.query.organizationId) {
      filter.organizationId = req.query.organizationId;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.language) {
      filter.language = req.query.language;
    }
    if (req.query.author) {
      filter.author = req.query.author;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') };
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
          sort['analytics.views'] = -1;
          break;
        case 'rating':
          sort['analytics.averageRating'] = -1;
          break;
        case 'helpful':
          sort['analytics.helpfulVotes'] = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const articles = await KnowledgeBase.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName email avatar')
      .populate('organizationId', 'name logoUrl');

    const total = await KnowledgeBase.countDocuments(filter);

    // Get categories for filter
    const categories = await KnowledgeBase.distinct('category', { status: 'published' });

    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
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
 * @route   GET /api/v1/knowledge-base/featured
 * @desc    Get featured/popular articles
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const { organizationId, limit = 5 } = req.query;
    
    const filter = { status: 'published' };
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    const articles = await KnowledgeBase.find(filter)
      .sort({ 'analytics.views': -1, 'analytics.averageRating': -1 })
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName email avatar')
      .populate('organizationId', 'name logoUrl');

    res.status(200).json({
      success: true,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/knowledge-base/:slug
 * @desc    Get article by slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const article = await KnowledgeBase.findOne({ 
      slug: req.params.slug,
      status: 'published'
    })
    .populate('author', 'firstName lastName email avatar')
    .populate('organizationId', 'name logoUrl')
    .populate('relatedArticles', 'title slug excerpt analytics');

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Increment view count
    await article.incrementViews();

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/knowledge-base
 * @desc    Create new article
 * @access  Private
 */
router.post('/', auth.protect, requireMFA, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      subcategory,
      tags,
      visibility,
      planAccess,
      language,
      seo,
      attachments,
      scheduledPublish
    } = req.body;

    const article = new KnowledgeBase({
      organizationId: req.user.organizationId,
      title,
      content,
      excerpt,
      category,
      subcategory,
      tags,
      visibility,
      planAccess,
      language,
      seo,
      attachments,
      scheduledPublish,
      author: req.user.id
    });

    await article.save();

    res.status(201).json({
      success: true,
      data: article
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
 * @route   PUT /api/v1/knowledge-base/:id
 * @desc    Update article
 * @access  Private
 */
router.put('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check if user can edit this article
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this article'
      });
    }

    const updatedArticle = await KnowledgeBase.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedArticle
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
 * @route   DELETE /api/v1/knowledge-base/:id
 * @desc    Delete article
 * @access  Private
 */
router.delete('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check if user can delete this article
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this article'
      });
    }

    await article.remove();

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
 * @route   POST /api/v1/knowledge-base/:id/publish
 * @desc    Publish article
 * @access  Private
 */
router.post('/:id/publish', auth.protect, requireMFA, async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check if user can publish this article
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to publish this article'
      });
    }

    article.status = 'published';
    article.publishedAt = new Date();
    article.lastModifiedBy = req.user.id;
    await article.save();

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/knowledge-base/:id/unpublish
 * @desc    Unpublish article
 * @access  Private
 */
router.post('/:id/unpublish', auth.protect, requireMFA, async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check if user can unpublish this article
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to unpublish this article'
      });
    }

    article.status = 'draft';
    article.lastModifiedBy = req.user.id;
    await article.save();

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/knowledge-base/:id/helpful
 * @desc    Mark article as helpful
 * @access  Public
 */
router.post('/:id/helpful', async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    await article.addHelpfulVote();

    res.status(200).json({
      success: true,
      data: { helpfulVotes: article.analytics.helpfulVotes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/knowledge-base/:id/not-helpful
 * @desc    Mark article as not helpful
 * @access  Public
 */
router.post('/:id/not-helpful', async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    await article.addNotHelpfulVote();

    res.status(200).json({
      success: true,
      data: { notHelpfulVotes: article.analytics.notHelpfulVotes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/knowledge-base/:id/rate
 * @desc    Rate article
 * @access  Public
 */
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    await article.updateRating(rating);

    res.status(200).json({
      success: true,
      data: {
        averageRating: article.analytics.averageRating,
        ratingCount: article.analytics.ratingCount
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
 * @route   GET /api/v1/knowledge-base/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    const filter = { status: 'published' };
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    const categories = await KnowledgeBase.distinct('category', filter);
    const subcategories = await KnowledgeBase.distinct('subcategory', filter);

    res.status(200).json({
      success: true,
      data: {
        categories,
        subcategories: subcategories.filter(Boolean)
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
