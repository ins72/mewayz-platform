const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  slug: {
    type: String,
    required: [true, 'Article slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9-]+$/.test(v);
      },
      message: 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
  },
  content: {
    type: String,
    required: [true, 'Article content is required'],
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'review'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'plan-specific'],
    default: 'public'
  },
  planAccess: [{
    type: String,
    enum: ['free', 'pro', 'enterprise']
  }],
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  analytics: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: [0, 'Helpful votes cannot be negative']
    },
    notHelpfulVotes: {
      type: Number,
      default: 0,
      min: [0, 'Not helpful votes cannot be negative']
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  parentArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  }],
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['pdf', 'image', 'video', 'document', 'link'],
      required: true
    },
    url: {
      type: String,
      trim: true
    },
    size: {
      type: Number // in bytes
    },
    isDownloadable: {
      type: Boolean,
      default: true
    }
  }],
  scheduledPublish: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes for performance
knowledgeBaseSchema.index({ organizationId: 1 });
// Note: slug index is handled by unique: true in schema definition
knowledgeBaseSchema.index({ category: 1 });
knowledgeBaseSchema.index({ status: 1 });
knowledgeBaseSchema.index({ visibility: 1 });
knowledgeBaseSchema.index({ language: 1 });
knowledgeBaseSchema.index({ author: 1 });
knowledgeBaseSchema.index({ createdAt: -1 });
knowledgeBaseSchema.index({ 'analytics.views': -1 });
knowledgeBaseSchema.index({ 'analytics.averageRating': -1 });

// Compound indexes
knowledgeBaseSchema.index({ organizationId: 1, status: 1 });
knowledgeBaseSchema.index({ organizationId: 1, category: 1 });
knowledgeBaseSchema.index({ organizationId: 1, visibility: 1 });
knowledgeBaseSchema.index({ status: 1, publishedAt: -1 });

// Text search index
knowledgeBaseSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text'
});

// Virtual for article URL
knowledgeBaseSchema.virtual('articleUrl').get(function() {
  return `/knowledge-base/${this.slug}`;
});

// Virtual for helpful percentage
knowledgeBaseSchema.virtual('helpfulPercentage').get(function() {
  const total = this.analytics.helpfulVotes + this.analytics.notHelpfulVotes;
  return total > 0 ? Math.round((this.analytics.helpfulVotes / total) * 100) : 0;
});

// Virtual for author info
knowledgeBaseSchema.virtual('authorInfo', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

// Virtual for organization info
knowledgeBaseSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
knowledgeBaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Increment version on content changes
  if (this.isModified('content') || this.isModified('title')) {
    this.version += 1;
  }
  
  next();
});

// Static methods
knowledgeBaseSchema.statics.findPublished = function(organizationId) {
  return this.find({
    organizationId,
    status: 'published',
    $or: [
      { scheduledPublish: { $lte: new Date() } },
      { scheduledPublish: null }
    ]
  });
};

knowledgeBaseSchema.statics.findByCategory = function(organizationId, category) {
  return this.find({
    organizationId,
    category,
    status: 'published'
  });
};

knowledgeBaseSchema.statics.search = function(organizationId, query) {
  return this.find({
    organizationId,
    status: 'published',
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

knowledgeBaseSchema.statics.findPopular = function(organizationId, limit = 10) {
  return this.find({
    organizationId,
    status: 'published'
  })
  .sort({ 'analytics.views': -1 })
  .limit(limit);
};

knowledgeBaseSchema.statics.findByPlan = function(organizationId, planType) {
  return this.find({
    organizationId,
    status: 'published',
    $or: [
      { visibility: 'public' },
      { 
        visibility: 'plan-specific',
        planAccess: planType
      }
    ]
  });
};

// Instance methods
knowledgeBaseSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

knowledgeBaseSchema.methods.addHelpfulVote = function() {
  this.analytics.helpfulVotes += 1;
  return this.save();
};

knowledgeBaseSchema.methods.addNotHelpfulVote = function() {
  this.analytics.notHelpfulVotes += 1;
  return this.save();
};

knowledgeBaseSchema.methods.updateRating = function(newRating) {
  const totalRating = this.analytics.averageRating * this.analytics.ratingCount + newRating;
  this.analytics.ratingCount += 1;
  this.analytics.averageRating = totalRating / this.analytics.ratingCount;
  return this.save();
};

knowledgeBaseSchema.methods.canAccess = function(userPlan) {
  if (this.visibility === 'public') return true;
  if (this.visibility === 'plan-specific') {
    return this.planAccess.includes(userPlan);
  }
  return false;
};

// Error handling middleware
knowledgeBaseSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Article with this slug already exists'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema); 