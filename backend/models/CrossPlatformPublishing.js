const mongoose = require('mongoose');

// Platform Connection Schema
const platformConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['twitter', 'linkedin', 'instagram', 'tiktok', 'youtube', 'facebook', 'pinterest', 'snapchat', 'reddit', 'medium', 'substack', 'telegram', 'discord', 'twitch', 'clubhouse', 'spotify', 'anchor', 'wordpress', 'wix', 'squarespace'],
    required: true
  },
  credentials: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    scope: [String]
  },
  profile: {
    platformUserId: String,
    username: String,
    displayName: String,
    profilePicture: String,
    followerCount: Number,
    verified: Boolean
  },
  settings: {
    autoPublish: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    defaultHashtags: [String],
    defaultMentions: [String],
    crossPostEnabled: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'suspended'],
    default: 'connected'
  },
  lastSync: Date,
  errorLog: [{
    error: String,
    timestamp: Date,
    resolved: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Content Publishing Schema
const contentPublishingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignName: String,
  originalContent: {
    title: String,
    content: String,
    mediaUrls: [String],
    contentType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'carousel', 'story', 'reel'],
      required: true
    }
  },
  platformVersions: [{
    platform: String,
    optimizedContent: {
      title: String,
      content: String,
      hashtags: [String],
      mentions: [String],
      mediaUrls: [String],
      thumbnail: String
    },
    formatting: {
      characterLimit: Number,
      aspectRatio: String,
      duration: Number,
      resolution: String
    },
    scheduling: {
      publishAt: Date,
      timezone: String,
      optimalTime: Boolean
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed', 'deleted'],
      default: 'draft'
    },
    platformPostId: String,
    publishedAt: Date,
    analytics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 }
    }
  }],
  globalSettings: {
    publishToAll: { type: Boolean, default: false },
    excludePlatforms: [String],
    crossPromote: { type: Boolean, default: false },
    brandConsistency: { type: Boolean, default: true }
  },
  aiOptimization: {
    contentOptimized: { type: Boolean, default: false },
    timingOptimized: { type: Boolean, default: false },
    hashtagsOptimized: { type: Boolean, default: false },
    engagementPrediction: Number
  },
  overallAnalytics: {
    totalViews: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 },
    bestPerformingPlatform: String,
    worstPerformingPlatform: String,
    averageEngagement: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Content Calendar Schema
const contentCalendarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calendarName: {
    type: String,
    required: true
  },
  scheduledPosts: [{
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentPublishing'
    },
    title: String,
    platforms: [String],
    scheduledDate: Date,
    status: String,
    contentType: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    tags: [String]
  }],
  templates: [{
    name: String,
    description: String,
    schedule: [{
      dayOfWeek: Number, // 0-6 (Sunday-Saturday)
      time: String,
      platform: String,
      contentType: String
    }],
    active: { type: Boolean, default: false }
  }],
  analytics: {
    postsThisMonth: { type: Number, default: 0 },
    engagementThisMonth: { type: Number, default: 0 },
    bestPostingTimes: [{
      platform: String,
      optimalHours: [Number],
      optimalDays: [Number]
    }],
    contentPerformance: [{
      contentType: String,
      averageEngagement: Number,
      totalPosts: Number
    }]
  },
  settings: {
    autoSchedule: { type: Boolean, default: false },
    optimalTimingEnabled: { type: Boolean, default: true },
    bufferTime: { type: Number, default: 15 }, // minutes
    notifications: {
      beforePublish: { type: Number, default: 60 }, // minutes
      afterPublish: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Cross-Platform Analytics Schema
const crossPlatformAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportDate: {
    type: Date,
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  platformMetrics: [{
    platform: String,
    metrics: {
      followers: Number,
      posts: Number,
      views: Number,
      likes: Number,
      shares: Number,
      comments: Number,
      clicks: Number,
      reach: Number,
      impressions: Number,
      engagementRate: Number,
      growthRate: Number,
      topPerformingPost: String,
      averageEngagement: Number
    },
    demographics: {
      ageGroups: [{
        range: String,
        percentage: Number
      }],
      genderSplit: {
        male: Number,
        female: Number,
        other: Number
      },
      topLocations: [{
        country: String,
        percentage: Number
      }]
    }
  }],
  overallMetrics: {
    totalFollowers: Number,
    totalPosts: Number,
    totalEngagement: Number,
    averageEngagementRate: Number,
    bestPerformingPlatform: String,
    fastestGrowingPlatform: String,
    totalReach: Number,
    totalImpressions: Number
  },
  insights: [{
    type: {
      type: String,
      enum: ['growth-opportunity', 'content-suggestion', 'timing-optimization', 'platform-expansion', 'audience-insight']
    },
    title: String,
    description: String,
    recommendation: String,
    priority: String,
    expectedImpact: String
  }],
  benchmarks: {
    industryAverage: {
      engagementRate: Number,
      postFrequency: Number,
      growthRate: Number
    },
    competitorComparison: [{
      competitor: String,
      metric: String,
      theirValue: Number,
      yourValue: Number,
      gap: Number
    }]
  }
}, {
  timestamps: true
});

// Audience Unification Schema
const audienceUnificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unifiedProfile: {
    totalUniqueFollowers: Number,
    overlap: [{
      platforms: [String],
      count: Number,
      percentage: Number
    }],
    segments: [{
      name: String,
      description: String,
      size: Number,
      platforms: [String],
      characteristics: [String],
      engagementLevel: String
    }]
  },
  crossPlatformUsers: [{
    userId: String, // Platform-specific user ID
    platforms: [{
      platform: String,
      username: String,
      followerSince: Date,
      engagementLevel: String,
      lastActive: Date
    }],
    unifiedMetrics: {
      totalEngagement: Number,
      averageEngagement: Number,
      preferredPlatform: String,
      lifetimeValue: Number
    },
    demographics: {
      estimatedAge: Number,
      estimatedLocation: String,
      interests: [String]
    }
  }],
  insights: {
    platformLoyalty: [{
      platform: String,
      loyaltyScore: Number,
      retentionRate: Number
    }],
    crossPlatformBehavior: [{
      pattern: String,
      frequency: Number,
      impact: String
    }],
    opportunityMatrix: [{
      fromPlatform: String,
      toPlatform: String,
      potential: Number,
      recommendation: String
    }]
  },
  lastAnalysis: Date
}, {
  timestamps: true
});

// Export models
const PlatformConnection = mongoose.model('PlatformConnection', platformConnectionSchema);
const ContentPublishing = mongoose.model('ContentPublishing', contentPublishingSchema);
const ContentCalendar = mongoose.model('ContentCalendar', contentCalendarSchema);
const CrossPlatformAnalytics = mongoose.model('CrossPlatformAnalytics', crossPlatformAnalyticsSchema);
const AudienceUnification = mongoose.model('AudienceUnification', audienceUnificationSchema);

module.exports = {
  PlatformConnection,
  ContentPublishing,
  ContentCalendar,
  CrossPlatformAnalytics,
  AudienceUnification
}; 