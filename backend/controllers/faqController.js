const FAQ = require('../models/FAQ');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all FAQs
// @route   GET /api/v1/faqs
// @access  Public
exports.getFaqs = asyncHandler(async (req, res, next) => {
    const { category, search, page = 1, limit = 10, sort = '-priority' } = req.query;

    let query = { isPublished: true };

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Search functionality
    if (search) {
        query.$or = [
            { question: { $regex: search, $options: 'i' } },
            { answer: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const faqs = await FAQ.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

    const total = await FAQ.countDocuments(query);

    res.status(200).json({
        success: true,
        count: faqs.length,
        total,
        pagination: {
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
        },
        data: faqs
    });
});

// @desc    Get single FAQ
// @route   GET /api/v1/faqs/:id
// @access  Public
exports.getFaq = asyncHandler(async (req, res, next) => {
    const faq = await FAQ.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('lastUpdatedBy', 'name email');

    if (!faq) {
        return next(new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404));
    }

    // Increment view count
    await faq.incrementViewCount();

    res.status(200).json({
        success: true,
        data: faq
    });
});

// @desc    Create new FAQ
// @route   POST /api/v1/faqs
// @access  Private
exports.createFaq = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user.id;

    const faq = await FAQ.create(req.body);

    res.status(201).json({
        success: true,
        data: faq
    });
});

// @desc    Update FAQ
// @route   PUT /api/v1/faqs/:id
// @access  Private
exports.updateFaq = asyncHandler(async (req, res, next) => {
    let faq = await FAQ.findById(req.params.id);

    if (!faq) {
        return next(new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404));
    }

    req.body.lastUpdatedBy = req.user.id;

    faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: faq
    });
});

// @desc    Delete FAQ
// @route   DELETE /api/v1/faqs/:id
// @access  Private
exports.deleteFaq = asyncHandler(async (req, res, next) => {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
        return next(new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404));
    }

    await faq.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Mark FAQ as helpful
// @route   POST /api/v1/faqs/:id/helpful
// @access  Public
exports.markHelpful = asyncHandler(async (req, res, next) => {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
        return next(new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404));
    }

    await faq.markHelpful();

    res.status(200).json({
        success: true,
        data: {
            helpfulCount: faq.helpfulCount,
            notHelpfulCount: faq.notHelpfulCount,
            helpfulRatio: faq.helpfulRatio
        }
    });
});

// @desc    Mark FAQ as not helpful
// @route   POST /api/v1/faqs/:id/not-helpful
// @access  Public
exports.markNotHelpful = asyncHandler(async (req, res, next) => {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
        return next(new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404));
    }

    await faq.markNotHelpful();

    res.status(200).json({
        success: true,
        data: {
            helpfulCount: faq.helpfulCount,
            notHelpfulCount: faq.notHelpfulCount,
            helpfulRatio: faq.helpfulRatio
        }
    });
});

// @desc    Get FAQ categories
// @route   GET /api/v1/faqs/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
    const categories = await FAQ.aggregate([
        { $match: { isPublished: true } },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: categories
    });
});

// @desc    Get popular FAQs
// @route   GET /api/v1/faqs/popular
// @access  Public
exports.getPopularFaqs = asyncHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;

    const faqs = await FAQ.find({ isPublished: true })
        .sort({ viewCount: -1, helpfulCount: -1 })
        .limit(parseInt(limit))
        .populate('createdBy', 'name email');

    res.status(200).json({
        success: true,
        count: faqs.length,
        data: faqs
    });
});

// @desc    Search FAQs
// @route   GET /api/v1/faqs/search
// @access  Public
exports.searchFaqs = asyncHandler(async (req, res, next) => {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
        return next(new ErrorResponse('Search query is required', 400));
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const faqs = await FAQ.search(q)
        .skip(skip)
        .limit(limitNum);

    const total = await FAQ.countDocuments({
        isPublished: true,
        $or: [
            { question: { $regex: q, $options: 'i' } },
            { answer: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
        ]
    });

    res.status(200).json({
        success: true,
        count: faqs.length,
        total,
        pagination: {
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
        },
        data: faqs
    });
}); 