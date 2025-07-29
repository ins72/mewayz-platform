const mongoose = require('mongoose');

const crossPlatformContentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  campaignName: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [200, 'Campaign name cannot exceed 200 characters']
  },
  originalContent: {
    title: {
      type: String,
      required: [true, 'Content title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters']
    },
    content: {
      type: String,
      required: [true, 'Content body is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    contentType: {
      type: String,
      enum: ['post', 'article', 'video', 'image', 'story', 'reel'],
      default: 'post'
    },
    mediaUrls: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true
    }],
    hashtags: [{
      type: String,
      trim: true
    }]
  },
  platformVersions: [{
    platform: {
      type: String,
      required: true,
      enum: ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'pinterest']
    },
    platformConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlatformConnection',
      required: true
    },
    adaptedContent: {
      title: String,
      content: String,
      mediaUrls: [String],
      platformSpecificData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'publishing', 'published', 'failed', 'deleted'],
      default: 'draft'
    },
    scheduledAt: {
      type: Date
    },
    publishedAt: {
      type: Date
    },
    platformPostId: {
      type: String,
      trim: true
    },
    analytics: {
      views: {
        type: Number,
        default: 0
      },
      likes: {
        type: Number,
        default: 0
      },
      shares: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      engagement: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    errorMessage: {
      type: String,
      trim: true
    },
    retryCount: {
      type: Number,
      default: 0,
      max: 3
    }
  }],
  overallStatus: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'partial', 'published', 'failed'],
    default: 'draft',
    index: true
  },
  scheduledPublishAt: {
    type: Date,
    index: true
  },
  totalEngagement: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  publishingStrategy: {
    autoOptimize: {
      type: Boolean,
      default: false
    },
    bestTimePublishing: {
      type: Boolean,
      default: false
    },
    audienceTargeting: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
crossPlatformContentSchema.index({ userId: 1, overallStatus: 1 });
crossPlatformContentSchema.index({ organizationId: 1, createdAt: -1 });
crossPlatformContentSchema.index({ scheduledPublishAt: 1, overallStatus: 1 });
crossPlatformContentSchema.index({ 'platformVersions.platform': 1, 'platformVersions.status': 1 });
crossPlatformContentSchema.index({ campaignName: 'text', 'originalContent.title': 'text', 'originalContent.content': 'text' });

// Virtual for success rate
crossPlatformContentSchema.virtual('successRate').get(function() {
  if (this.platformVersions.length === 0) return 0;
  
  const publishedCount = this.platformVersions.filter(v => v.status === 'published').length;
  return Math.round((publishedCount / this.platformVersions.length) * 100);
});

// Virtual for total platforms
crossPlatformContentSchema.virtual('totalPlatforms').get(function() {
  return this.platformVersions.length;
});

// Virtual for published platforms
crossPlatformContentSchema.virtual('publishedPlatforms').get(function() {
  return this.platformVersions.filter(v => v.status === 'published').length;
});

// Instance methods
crossPlatformContentSchema.methods.updateAnalytics = async function() {
  let totalViews = 0;
  let totalEngagement = 0;
  
  this.platformVersions.forEach(version => {
    totalViews += version.analytics.views || 0;
    totalEngagement += (version.analytics.likes || 0) + 
                      (version.analytics.shares || 0) + 
                      (version.analytics.comments || 0) + 
                      (version.analytics.clicks || 0);
  });
  
  this.totalViews = totalViews;
  this.totalEngagement = totalEngagement;
  
  return this.save();
};

crossPlatformContentSchema.methods.updateOverallStatus = function() {
  const statuses = this.platformVersions.map(v => v.status);
  
  if (statuses.every(s => s === 'published')) {
    this.overallStatus = 'published';
  } else if (statuses.every(s => s === 'failed')) {
    this.overallStatus = 'failed';
  } else if (statuses.some(s => s === 'published') && statuses.some(s => s === 'failed')) {
    this.overallStatus = 'partial';
  } else if (statuses.every(s => s === 'scheduled')) {
    this.overallStatus = 'scheduled';
  } else if (statuses.some(s => s === 'publishing')) {
    this.overallStatus = 'publishing';
  } else {
    this.overallStatus = 'draft';
  }
  
  return this;
};

crossPlatformContentSchema.methods.canRetry = function(platform) {
  const version = this.platformVersions.find(v => v.platform === platform);
  return version && version.status === 'failed' && version.retryCount < 3;
};

crossPlatformContentSchema.methods.incrementRetry = function(platform) {
  const version = this.platformVersions.find(v => v.platform === platform);
  if (version) {
    version.retryCount += 1;
    version.status = version.retryCount >= 3 ? 'failed' : 'publishing';
  }
  return this;
};

// Static methods
crossPlatformContentSchema.statics.getPublishedContent = function(userId, organizationId = null, limit = 50, page = 1) {
  const query = { 
    userId, 
    overallStatus: { $in: ['published', 'partial'] },
    isActive: true 
  };
  
  if (organizationId) {
    query.organizationId = organizationId;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email')
    .populate('organizationId', 'name');
};

crossPlatformContentSchema.statics.getScheduledContent = function(userId, organizationId = null) {
  const query = { 
    userId, 
    overallStatus: 'scheduled',
    scheduledPublishAt: { $gte: new Date() },
    isActive: true 
  };
  
  if (organizationId) {
    query.organizationId = organizationId;
  }
  
  return this.find(query)
    .sort({ scheduledPublishAt: 1 })
    .populate('userId', 'name email');
};

crossPlatformContentSchema.statics.getContentForPublishing = function() {
  return this.find({
    overallStatus: 'scheduled',
    scheduledPublishAt: { $lte: new Date() },
    isActive: true,
    'platformVersions.status': 'scheduled'
  }).populate('userId', 'name email');
};

crossPlatformContentSchema.statics.getAnalyticsSummary = function(userId, organizationId = null, startDate = null, endDate = null) {
  const matchQuery = { 
    userId, 
    overallStatus: { $in: ['published', 'partial'] },
    isActive: true 
  };
  
  if (organizationId) {
    matchQuery.organizationId = organizationId;
  }
  
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalViews: { $sum: '$totalViews' },
        totalEngagement: { $sum: '$totalEngagement' },
        averageEngagement: { $avg: '$totalEngagement' },
        platformBreakdown: {
          $push: {
            platforms: '$platformVersions.platform',
            views: '$platformVersions.analytics.views',
            engagement: '$platformVersions.analytics.engagement'
          }
        }
      }
    }
  ]);
};

// Pre-save middleware
crossPlatformContentSchema.pre('save', function(next) {
  this.updateOverallStatus();
  next();
});

// Post-save middleware for analytics update
crossPlatformContentSchema.post('save', async function(doc) {
  if (doc.isModified('platformVersions')) {
    await doc.updateAnalytics();
  }
});

module.exports = mongoose.model('CrossPlatformContent', crossPlatformContentSchema); 