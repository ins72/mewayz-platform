const asyncHandler = require('express-async-handler');
const FAQ = require('../models/FAQ');

// @desc    Get all FAQ categories
// @route   GET /api/v1/faqs
// @access  Public
const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.getActiveCategories();
  
  res.status(200).json({
    success: true,
    count: faqs.length,
    data: faqs
  });
});

// @desc    Get single FAQ category
// @route   GET /api/v1/faqs/:id
// @access  Public
const getFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  res.status(200).json({
    success: true,
    data: faq
  });
});

// @desc    Create new FAQ category
// @route   POST /api/v1/faqs
// @access  Private (Admin only)
const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body);
  
  res.status(201).json({
    success: true,
    data: faq
  });
});

// @desc    Update FAQ category
// @route   PUT /api/v1/faqs/:id
// @access  Private (Admin only)
const updateFAQ = asyncHandler(async (req, res) => {
  let faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: faq
  });
});

// @desc    Delete FAQ category
// @route   DELETE /api/v1/faqs/:id
// @access  Private (Admin only)
const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  await faq.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search FAQs
// @route   GET /api/v1/faqs/search
// @access  Public
const searchFAQs = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    res.status(400);
    throw new Error('Please provide a search term');
  }
  
  const faqs = await FAQ.searchFAQs(q);
  
  res.status(200).json({
    success: true,
    count: faqs.length,
    data: faqs
  });
});

// @desc    Add FAQ item to category
// @route   POST /api/v1/faqs/:id/items
// @access  Private (Admin only)
const addFAQItem = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  faq.items.push(req.body);
  await faq.save();
  
  res.status(201).json({
    success: true,
    data: faq
  });
});

// @desc    Update FAQ item
// @route   PUT /api/v1/faqs/:id/items/:itemId
// @access  Private (Admin only)
const updateFAQItem = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  const item = faq.items.id(req.params.itemId);
  
  if (!item) {
    res.status(404);
    throw new Error('FAQ item not found');
  }
  
  Object.assign(item, req.body);
  await faq.save();
  
  res.status(200).json({
    success: true,
    data: faq
  });
});

// @desc    Delete FAQ item
// @route   DELETE /api/v1/faqs/:id/items/:itemId
// @access  Private (Admin only)
const deleteFAQItem = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  const item = faq.items.id(req.params.itemId);
  
  if (!item) {
    res.status(404);
    throw new Error('FAQ item not found');
  }
  
  item.remove();
  await faq.save();
  
  res.status(200).json({
    success: true,
    data: faq
  });
});

// @desc    Add view to FAQ item
// @route   POST /api/v1/faqs/:id/items/:itemId/view
// @access  Public
const addFAQItemView = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  await faq.addView(req.params.itemId);
  
  res.status(200).json({
    success: true,
    message: 'View added successfully'
  });
});

// @desc    Mark FAQ item as helpful
// @route   POST /api/v1/faqs/:id/items/:itemId/helpful
// @access  Public
const markFAQItemHelpful = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  await faq.markHelpful(req.params.itemId);
  
  res.status(200).json({
    success: true,
    message: 'Marked as helpful'
  });
});

// @desc    Mark FAQ item as not helpful
// @route   POST /api/v1/faqs/:id/items/:itemId/not-helpful
// @access  Public
const markFAQItemNotHelpful = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ category not found');
  }
  
  await faq.markNotHelpful(req.params.itemId);
  
  res.status(200).json({
    success: true,
    message: 'Marked as not helpful'
  });
});

// @desc    Get FAQ statistics
// @route   GET /api/v1/faqs/stats
// @access  Private (Admin only)
const getFAQStats = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({ isActive: true });
  
  const stats = {
    totalCategories: faqs.length,
    totalItems: faqs.reduce((sum, faq) => sum + faq.totalItems, 0),
    totalViews: faqs.reduce((sum, faq) => sum + faq.totalViews, 0),
    mostViewedCategory: null,
    mostViewedItem: null
  };
  
  if (faqs.length > 0) {
    // Find most viewed category
    const mostViewedCategory = faqs.reduce((prev, current) => 
      (prev.totalViews > current.totalViews) ? prev : current
    );
    stats.mostViewedCategory = {
      name: mostViewedCategory.name,
      views: mostViewedCategory.totalViews
    };
    
    // Find most viewed item
    let mostViewedItem = null;
    let maxViews = 0;
    
    faqs.forEach(faq => {
      faq.items.forEach(item => {
        if (item.views > maxViews) {
          maxViews = item.views;
          mostViewedItem = {
            title: item.title,
            category: faq.name,
            views: item.views
          };
        }
      });
    });
    
    stats.mostViewedItem = mostViewedItem;
  }
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  searchFAQs,
  addFAQItem,
  updateFAQItem,
  deleteFAQItem,
  addFAQItemView,
  markFAQItemHelpful,
  markFAQItemNotHelpful,
  getFAQStats
}; 