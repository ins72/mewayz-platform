const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor ID is required']
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [255, 'Course title cannot exceed 255 characters']
  },
  slug: {
    type: String,
    required: [true, 'Course slug is required'],
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
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  previewVideoUrl: {
    type: String,
    trim: true
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [1, 'Duration must be at least 1 minute'],
    default: 60
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
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
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: [0, 'Enrollment count cannot be negative']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  completionRate: {
    type: Number,
    default: 0,
    min: [0, 'Completion rate cannot be negative'],
    max: [100, 'Completion rate cannot exceed 100%']
  },
  certificateTemplate: {
    enabled: {
      type: Boolean,
      default: true
    },
    templateId: {
      type: String,
      trim: true
    },
    customText: {
      type: String,
      trim: true
    }
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    trim: true
  },
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'audio', 'link', 'file'],
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
  settings: {
    allowReviews: {
      type: Boolean,
      default: true
    },
    allowQuestions: {
      type: Boolean,
      default: true
    },
    allowDiscussions: {
      type: Boolean,
      default: true
    },
    requireEnrollment: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    autoComplete: {
      type: Boolean,
      default: false
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: [1, 'Max attempts must be at least 1']
    }
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
    totalViews: {
      type: Number,
      default: 0
    },
    totalWatchTime: {
      type: Number,
      default: 0 // in seconds
    },
    averageWatchTime: {
      type: Number,
      default: 0 // in seconds
    },
    dropOffRate: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
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

// Indexes for performance
courseSchema.index({ organizationId: 1 });
courseSchema.index({ instructorId: 1 });
// Note: slug index is handled by unique: true in schema definition
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ enrollmentCount: -1 });
courseSchema.index({ 'rating.average': -1 });

// Compound indexes
courseSchema.index({ organizationId: 1, isPublished: 1 });
courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ instructorId: 1, status: 1 });

// Virtual for course URL
courseSchema.virtual('courseUrl').get(function() {
  return `/courses/${this.slug}`;
});

// Virtual for instructor info
courseSchema.virtual('instructor', {
  ref: 'User',
  localField: 'instructorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for organization info
courseSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true
});

// Virtual for lessons count
courseSchema.virtual('lessonsCount').get(function() {
  // This would be populated with actual lessons count
  return 0;
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function() {
  // This would be calculated from actual lessons
  return this.estimatedDuration;
});

// Virtual for price display
courseSchema.virtual('priceDisplay').get(function() {
  if (this.price === 0) {
    return 'Free';
  }
  return `${this.currency} ${this.price.toFixed(2)}`;
});

// Virtual for discount percentage
courseSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) {
    return 0;
  }
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Pre-save middleware
courseSchema.pre('save', function(next) {
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
  
  // Set original price if not set
  if (!this.originalPrice && this.price > 0) {
    this.originalPrice = this.price;
  }
  
  next();
});

// Static methods
courseSchema.statics.findPublished = function() {
  return this.find({ isPublished: true, status: 'published' });
};

courseSchema.statics.findByCategory = function(category) {
  return this.find({ category, isPublished: true, status: 'published' });
};

courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructorId });
};

courseSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isPublished: true, status: 'published' });
};

courseSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isPublished: true, status: 'published' },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  });
};

// Instance methods
courseSchema.methods.incrementEnrollment = function() {
  this.enrollmentCount += 1;
  return this.save();
};

courseSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

courseSchema.methods.isEnrolled = function(userId) {
  // This would check if user is enrolled
  return false;
};

courseSchema.methods.getProgress = function(userId) {
  // This would calculate user progress
  return 0;
};

courseSchema.methods.canAccess = function(userId) {
  // This would check if user can access the course
  return this.isPublished && this.status === 'published';
};

// Error handling middleware
courseSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Course with this slug already exists'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Course', courseSchema); 