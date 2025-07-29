const mongoose = require('mongoose');

const ShopItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a shop item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  images: [{
    url: String,
    alt: String
  }],
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['UI Design Kit', 'Fonts', 'Illustration', '3D Assets', 'Icons', 'Templates', 'Mockups', 'Branding', 'Mobile App', 'Web Design']
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  salesCount: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  creatorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Creator',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'rejected'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number,
    min: [0, 'File size cannot be negative']
  },
  fileFormat: {
    type: String,
    trim: true
  },
  license: {
    type: String,
    enum: ['standard', 'extended', 'exclusive'],
    default: 'standard'
  },
  software: [{
    type: String,
    enum: ['Sketch', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects', 'Principle', 'Framer']
  }],
  compatibility: [{
    type: String,
    enum: ['iOS', 'Android', 'Web', 'Desktop', 'Tablet']
  }],
  dimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['px', 'pt', 'mm', 'in'],
      default: 'px'
    }
  },
  colors: [{
    name: String,
    hex: String
  }],
  fonts: [{
    name: String,
    weight: String
  }],
  downloadFiles: [{
    name: String,
    format: String,
    size: Number,
    url: String
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  publishedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for search optimization
ShopItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
ShopItemSchema.index({ category: 1, status: 1, isActive: 1 });
ShopItemSchema.index({ creatorId: 1, status: 1 });
ShopItemSchema.index({ price: 1 });
ShopItemSchema.index({ rating: -1, reviewCount: -1 });
ShopItemSchema.index({ salesCount: -1 });
ShopItemSchema.index({ isFeatured: -1, isPromoted: -1 });
// Note: seo.slug index is handled by unique: true in schema definition

// Virtual for discount percentage
ShopItemSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for average rating display
ShopItemSchema.virtual('averageRating').get(function() {
  return Math.round(this.rating * 10) / 10;
});

// Virtual for formatted price
ShopItemSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Pre-save middleware to update timestamps and generate slug
ShopItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug if not provided
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Set published date when status changes to published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Method to update analytics
ShopItemSchema.methods.updateAnalytics = function(type, value = 1) {
  if (this.analytics[type] !== undefined) {
    this.analytics[type] += value;
  }
  
  // Update conversion rate
  if (this.analytics.clicks > 0) {
    this.analytics.conversionRate = (this.salesCount / this.analytics.clicks) * 100;
  }
  
  return this.save();
};

// Method to add review
ShopItemSchema.methods.addReview = function(rating) {
  const totalRating = (this.rating * this.reviewCount) + rating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  
  return this.save();
};

// Static method to get featured items
ShopItemSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    status: 'published', 
    isActive: true, 
    isFeatured: true 
  })
  .sort({ salesCount: -1, rating: -1 })
  .limit(limit)
  .populate('creatorId', 'login avatar stats')
  .exec();
};

// Static method to get popular items
ShopItemSchema.statics.getPopular = function(limit = 10) {
  return this.find({ 
    status: 'published', 
    isActive: true 
  })
  .sort({ salesCount: -1, viewCount: -1 })
  .limit(limit)
  .populate('creatorId', 'login avatar stats')
  .exec();
};

// Static method to search items
ShopItemSchema.statics.searchItems = function(query, filters = {}) {
  const searchQuery = {
    status: 'published',
    isActive: true,
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, salesCount: -1 })
    .populate('creatorId', 'login avatar stats')
    .exec();
};

module.exports = mongoose.model('ShopItem', ShopItemSchema); 