const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  login: {
    type: String,
    required: [true, 'Please add a login/username'],
    unique: true,
    trim: true,
    maxlength: [50, 'Login cannot be more than 50 characters']
  },
  details: {
    type: String,
    required: [true, 'Please add creator details'],
    maxlength: [500, 'Details cannot be more than 500 characters']
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    maxlength: [100, 'Label cannot be more than 100 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastActiveTime: {
    type: Date,
    default: Date.now
  },
  shop: [{
    id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    image: String
  }],
  socials: [{
    icon: {
      type: String,
      enum: ['twitter', 'instagram', 'threads', 'facebook', 'linkedin', 'dribbble', 'behance']
    },
    href: {
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid URL'
      }
    }
  }],
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization'
  },
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    }
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  specialties: [{
    type: String,
    enum: ['Mobile App', '3D Illustrations', 'UI Design Kit', 'Fonts', 'Product Design', 'Branding', 'Animation', 'Web Design']
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  location: {
    country: String,
    city: String,
    timezone: String
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

// Create index for search optimization
CreatorSchema.index({ login: 'text', details: 'text', tags: 'text', bio: 'text' });
CreatorSchema.index({ isOnline: 1, featured: -1, 'stats.rating': -1 });
CreatorSchema.index({ specialties: 1 });
CreatorSchema.index({ organizationId: 1 });

// Virtual for time since last active
CreatorSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.lastActiveTime;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} mins`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours`;
  
  const days = Math.floor(hours / 24);
  return `${days} days`;
});

// Pre-save middleware to update timestamps
CreatorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to update online status
CreatorSchema.methods.updateOnlineStatus = function() {
  this.isOnline = true;
  this.lastActiveTime = new Date();
  return this.save();
};

// Method to update stats
CreatorSchema.methods.updateStats = async function() {
  const Product = mongoose.model('Product');
  const stats = await Product.aggregate([
    { $match: { creatorId: this._id } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalSales: { $sum: '$salesCount' },
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: '$reviewCount' }
      }
    }
  ]);

  if (stats.length > 0) {
    this.stats.totalProducts = stats[0].totalProducts || 0;
    this.stats.totalSales = stats[0].totalSales || 0;
    this.stats.rating = Math.round((stats[0].avgRating || 0) * 10) / 10;
    this.stats.reviewCount = stats[0].totalReviews || 0;
  }

  return this.save();
};

// Static method to find featured creators
CreatorSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ featured: true, isActive: true })
    .sort({ 'stats.rating': -1, 'stats.followers': -1 })
    .limit(limit)
    .populate('userId', 'name email avatar')
    .exec();
};

// Static method to search creators
CreatorSchema.statics.searchCreators = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, featured: -1, 'stats.rating': -1 })
    .populate('userId', 'name email avatar')
    .exec();
};

module.exports = mongoose.model('Creator', CreatorSchema); 