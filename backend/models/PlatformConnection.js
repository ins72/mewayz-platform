const mongoose = require('mongoose');

const platformConnectionSchema = new mongoose.Schema({
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
  platform: {
    type: String,
    required: [true, 'Platform name is required'],
    enum: ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'pinterest'],
    index: true
  },
  connected: {
    type: Boolean,
    default: false,
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  profileUrl: {
    type: String,
    trim: true
  },
  followerCount: {
    type: Number,
    default: 0,
    min: [0, 'Follower count cannot be negative']
  },
  followingCount: {
    type: Number,
    default: 0,
    min: [0, 'Following count cannot be negative']
  },
  platformUserId: {
    type: String,
    required: [true, 'Platform user ID is required'],
    trim: true
  },
  accessToken: {
    type: String,
    select: false // Don't include in queries by default for security
  },
  refreshToken: {
    type: String,
    select: false // Don't include in queries by default for security
  },
  tokenExpiresAt: {
    type: Date
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'error'],
    default: 'active',
    index: true
  },
  apiLimits: {
    dailyPostLimit: {
      type: Number,
      default: 100
    },
    currentDailyPosts: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'analytics']
  }],
  connectionMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
platformConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });
platformConnectionSchema.index({ organizationId: 1, connected: 1 });
platformConnectionSchema.index({ platform: 1, status: 1 });
platformConnectionSchema.index({ lastSync: 1 });

// Virtual for platform display info
platformConnectionSchema.virtual('platformInfo').get(function() {
  const platformConfigs = {
    twitter: { name: 'Twitter/X', color: '#1DA1F2', icon: 'twitter' },
    linkedin: { name: 'LinkedIn', color: '#0077B5', icon: 'linkedin' },
    facebook: { name: 'Facebook', color: '#1877F2', icon: 'facebook' },
    instagram: { name: 'Instagram', color: '#E4405F', icon: 'instagram' },
    tiktok: { name: 'TikTok', color: '#000000', icon: 'tiktok' },
    youtube: { name: 'YouTube', color: '#FF0000', icon: 'youtube' },
    pinterest: { name: 'Pinterest', color: '#BD081C', icon: 'pinterest' }
  };
  
  return platformConfigs[this.platform] || { name: this.platform, color: '#333333', icon: 'globe' };
});

// Instance methods
platformConnectionSchema.methods.updateFollowerCount = async function(newCount) {
  this.followerCount = newCount;
  this.lastSync = new Date();
  return this.save();
};

platformConnectionSchema.methods.refreshTokenIfNeeded = async function() {
  if (this.tokenExpiresAt && this.tokenExpiresAt < new Date()) {
    // Token refresh logic would go here
    this.status = 'expired';
    return this.save();
  }
  return this;
};

platformConnectionSchema.methods.canPost = function() {
  if (!this.connected || this.status !== 'active') {
    return false;
  }
  
  const today = new Date().toDateString();
  const lastResetDate = this.apiLimits.lastResetDate ? this.apiLimits.lastResetDate.toDateString() : null;
  
  // Reset daily post count if it's a new day
  if (today !== lastResetDate) {
    this.apiLimits.currentDailyPosts = 0;
    this.apiLimits.lastResetDate = new Date();
  }
  
  return this.apiLimits.currentDailyPosts < this.apiLimits.dailyPostLimit;
};

// Static methods
platformConnectionSchema.statics.getConnectedPlatforms = function(userId, organizationId = null) {
  const query = { 
    userId, 
    connected: true, 
    status: 'active',
    isActive: true 
  };
  
  if (organizationId) {
    query.organizationId = organizationId;
  }
  
  return this.find(query).sort({ platform: 1 });
};

platformConnectionSchema.statics.getTotalFollowers = function(userId, organizationId = null) {
  const query = { 
    userId, 
    connected: true, 
    status: 'active',
    isActive: true 
  };
  
  if (organizationId) {
    query.organizationId = organizationId;
  }
  
  return this.aggregate([
    { $match: query },
    { $group: { _id: null, totalFollowers: { $sum: '$followerCount' } } }
  ]);
};

// Pre-save middleware
platformConnectionSchema.pre('save', function(next) {
  if (this.isModified('accessToken') || this.isModified('refreshToken')) {
    this.lastSync = new Date();
  }
  next();
});

// Post-save middleware
platformConnectionSchema.post('save', function(doc) {
  // Could trigger analytics update or notification here
  console.log(`Platform connection updated: ${doc.platform} for user ${doc.userId}`);
});

module.exports = mongoose.model('PlatformConnection', platformConnectionSchema); 