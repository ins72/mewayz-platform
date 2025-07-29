const mongoose = require('mongoose');

const faqItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'FAQ item title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'FAQ item content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const faqSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'FAQ category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  items: [faqItemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: 'help-circle'
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
faqSchema.index({ name: 1, isActive: 1 });
faqSchema.index({ 'items.title': 'text', 'items.content': 'text' });

// Virtual for total items count
faqSchema.virtual('totalItems').get(function() {
  return this.items.filter(item => item.isActive).length;
});

// Virtual for total views
faqSchema.virtual('totalViews').get(function() {
  return this.items.reduce((total, item) => total + item.views, 0);
});

// Static method to get active FAQ categories
faqSchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort('sortOrder');
};

// Static method to search FAQs
faqSchema.statics.searchFAQs = function(searchTerm) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { 'items.title': { $regex: searchTerm, $options: 'i' } },
          { 'items.content': { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance method to add view to FAQ item
faqSchema.methods.addView = function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.views += 1;
    return this.save();
  }
  throw new Error('FAQ item not found');
};

// Instance method to mark FAQ item as helpful
faqSchema.methods.markHelpful = function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.helpful += 1;
    return this.save();
  }
  throw new Error('FAQ item not found');
};

// Instance method to mark FAQ item as not helpful
faqSchema.methods.markNotHelpful = function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.notHelpful += 1;
    return this.save();
  }
  throw new Error('FAQ item not found');
};

module.exports = mongoose.model('FAQ', faqSchema); 