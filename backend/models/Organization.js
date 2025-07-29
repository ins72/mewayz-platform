const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [255, 'Organization name cannot exceed 255 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  logoUrl: {
    type: String,
    trim: true
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9-]+$/.test(v);
      },
      message: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
    }
  },
  customDomain: {
    type: String,
    trim: true,
    lowercase: true
  },
  planType: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  revenueShare: {
    type: Number,
    min: [0, 'Revenue share cannot be negative'],
    max: [100, 'Revenue share cannot exceed 100%'],
    default: 30
  },
  monthlyFee: {
    type: Number,
    min: [0, 'Monthly fee cannot be negative'],
    default: 0
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually'],
    default: 'monthly'
  },
  trialEndsAt: {
    type: Date
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  features: {
    ecommerce: { type: Boolean, default: true },
    socialMedia: { type: Boolean, default: true },
    courses: { type: Boolean, default: true },
    crm: { type: Boolean, default: true },
    whiteLabel: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    dedicatedSupport: { type: Boolean, default: false }
  },
  limits: {
    users: { type: Number, default: 5 },
    products: { type: Number, default: 100 },
    storage: { type: Number, default: 1024 }, // MB
    apiCalls: { type: Number, default: 1000 },
    bandwidth: { type: Number, default: 10240 } // MB
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled', 'pending'],
    default: 'active'
  },
  billingInfo: {
    companyName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    taxId: String
  },
  contactInfo: {
    email: String,
    phone: String,
    supportEmail: String
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
// Note: subdomain index is handled by unique: true in schema definition
organizationSchema.index({ customDomain: 1 });
organizationSchema.index({ planType: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ createdAt: -1 });

// Virtual for full domain
organizationSchema.virtual('fullDomain').get(function() {
  if (this.customDomain) {
    return this.customDomain;
  }
  if (this.subdomain) {
    return `${this.subdomain}.mewayz.com`;
  }
  return null;
});

// Virtual for plan features
organizationSchema.virtual('hasFeature').get(function() {
  return (featureName) => {
    return this.features[featureName] || false;
  };
});

// Virtual for usage statistics
organizationSchema.virtual('usageStats').get(function() {
  // This would be populated with actual usage data
  return {
    users: 0,
    products: 0,
    storage: 0,
    apiCalls: 0,
    bandwidth: 0
  };
});

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set plan-specific defaults
  if (this.planType === 'free') {
    this.revenueShare = 30;
    this.monthlyFee = 0;
    this.features.whiteLabel = false;
    this.features.apiAccess = false;
    this.features.advancedAnalytics = false;
    this.features.customBranding = false;
    this.features.dedicatedSupport = false;
  } else if (this.planType === 'pro') {
    this.revenueShare = 0;
    this.monthlyFee = 49;
    this.features.customBranding = true;
    this.limits.users = 25;
    this.limits.products = 1000;
    this.limits.storage = 10240;
  } else if (this.planType === 'enterprise') {
    this.revenueShare = 15;
    this.monthlyFee = 99;
    this.features.whiteLabel = true;
    this.features.apiAccess = true;
    this.features.advancedAnalytics = true;
    this.features.customBranding = true;
    this.features.dedicatedSupport = true;
    this.limits.users = -1; // Unlimited
    this.limits.products = -1; // Unlimited
    this.limits.storage = -1; // Unlimited
  }
  
  next();
});

// Static methods
organizationSchema.statics.findByDomain = function(domain) {
  return this.findOne({
    $or: [
      { subdomain: domain.replace('.mewayz.com', '') },
      { customDomain: domain }
    ]
  });
};

organizationSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

organizationSchema.statics.findByPlanType = function(planType) {
  return this.find({ planType, status: 'active' });
};

// Instance methods
organizationSchema.methods.isFeatureEnabled = function(featureName) {
  return this.features[featureName] || false;
};

organizationSchema.methods.isWithinLimits = function(usageType, currentUsage) {
  const limit = this.limits[usageType];
  return limit === -1 || currentUsage < limit;
};

organizationSchema.methods.getBillingAmount = function() {
  if (this.planType === 'free') {
    return 0;
  }
  return this.monthlyFee;
};

organizationSchema.methods.isTrialExpired = function() {
  if (!this.trialEndsAt) return false;
  return new Date() > this.trialEndsAt;
};

// Error handling middleware
organizationSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Organization with this subdomain or domain already exists'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Organization', organizationSchema); 