const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

// @desc    Get all blog posts
// @route   GET /api/v1/blog/posts
// @access  Public
router.get('/posts', asyncHandler(async (req, res, next) => {
    const { category, page = 1, limit = 10, status = 'published' } = req.query;
    
    // Build query
    const query = { status };
    if (category) {
        query.category = category;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await BlogPost.find(query)
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
    
    const total = await BlogPost.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: posts,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

// @desc    Get single blog post
// @route   GET /api/v1/blog/posts/:id
// @access  Public
router.get('/posts/:id', asyncHandler(async (req, res, next) => {
    const post = await BlogPost.findById(req.params.id)
        .populate('author', 'name avatar bio')
        .lean();
    
    if (!post) {
        return next(new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404));
    }
    
    // Increment view count
    await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    res.status(200).json({
        success: true,
        data: post
    });
}));

// @desc    Create blog post
// @route   POST /api/v1/blog/posts
// @access  Private (Admin/Author)
router.post('/posts', auth.protect, asyncHandler(async (req, res, next) => {
    // Check if user has permission to create posts
    if (!['admin', 'author', 'editor'].includes(req.user.role)) {
        return next(new ErrorResponse('Not authorized to create blog posts', 403));
    }
    
    // Add author to request body
    req.body.author = req.user.id;
    
    // Set publishedAt if status is published
    if (req.body.status === 'published' && !req.body.publishedAt) {
        req.body.publishedAt = new Date();
    }
    
    const post = await BlogPost.create(req.body);
    
    // Populate author info
    await post.populate('author', 'name avatar');
    
    res.status(201).json({
        success: true,
        data: post
    });
}));

// @desc    Update blog post
// @route   PUT /api/v1/blog/posts/:id
// @access  Private (Admin/Author/Owner)
router.put('/posts/:id', auth.protect, asyncHandler(async (req, res, next) => {
    let post = await BlogPost.findById(req.params.id);
    
    if (!post) {
        return next(new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user has permission to update this post
    if (req.user.role !== 'admin' && post.author.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this blog post', 403));
    }
    
    // Set publishedAt if status is being changed to published
    if (req.body.status === 'published' && post.status !== 'published') {
        req.body.publishedAt = new Date();
    }
    
    post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('author', 'name avatar');
    
    res.status(200).json({
        success: true,
        data: post
    });
}));

// @desc    Delete blog post
// @route   DELETE /api/v1/blog/posts/:id
// @access  Private (Admin/Author/Owner)
router.delete('/posts/:id', auth.protect, asyncHandler(async (req, res, next) => {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
        return next(new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user has permission to delete this post
    if (req.user.role !== 'admin' && post.author.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to delete this blog post', 403));
    }
    
    await post.remove();
    
    res.status(200).json({
        success: true,
        data: {}
    });
}));

// @desc    Get blog categories
// @route   GET /api/v1/blog/categories
// @access  Public
router.get('/categories', asyncHandler(async (req, res, next) => {
    const categories = await BlogPost.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
        success: true,
        data: categories.map(cat => ({
            name: cat._id,
            count: cat.count
        }))
    });
}));

// @desc    Get featured blog posts
// @route   GET /api/v1/blog/featured
// @access  Public
router.get('/featured', asyncHandler(async (req, res, next) => {
    const { limit = 5 } = req.query;
    
    const posts = await BlogPost.find({ 
        status: 'published', 
        featured: true 
    })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .lean();
    
    res.status(200).json({
        success: true,
        data: posts
    });
}));

// @desc    Search blog posts
// @route   GET /api/v1/blog/search
// @access  Public
router.get('/search', asyncHandler(async (req, res, next) => {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
        return next(new ErrorResponse('Search query is required', 400));
    }
    
    const searchQuery = {
        status: 'published',
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
        ]
    };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await BlogPost.find(searchQuery)
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
    
    const total = await BlogPost.countDocuments(searchQuery);
    
    res.status(200).json({
        success: true,
        data: posts,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

// @desc    Add comment to blog post
// @route   POST /api/v1/blog/posts/:id/comments
// @access  Private
router.post('/posts/:id/comments', auth.protect, asyncHandler(async (req, res, next) => {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
        return next(new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404));
    }
    
    const comment = {
        author: req.user.id,
        content: req.body.content,
        createdAt: new Date()
    };
    
    post.comments.push(comment);
    await post.save();
    
    // Populate comment author info
    await post.populate('comments.author', 'name avatar');
    
    res.status(201).json({
        success: true,
        data: comment
    });
}));

// @desc    Get blog post comments
// @route   GET /api/v1/blog/posts/:id/comments
// @access  Public
router.get('/posts/:id/comments', asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;
    
    const post = await BlogPost.findById(req.params.id)
        .populate('comments.author', 'name avatar')
        .lean();
    
    if (!post) {
        return next(new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404));
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const comments = post.comments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
        success: true,
        data: comments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: post.comments.length,
            pages: Math.ceil(post.comments.length / parseInt(limit))
        }
    });
}));

module.exports = router; 
