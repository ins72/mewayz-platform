const mongoose = require('mongoose');

// Revenue Stream Schema
const revenueStreamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  streamName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['courses', 'digital-products', 'affiliate-marketing', 'sponsorships', 'memberships', 'tips', 'services', 'licensing', 'nft', 'merchandise'],
    required: true
  },
  description: String,
  pricing: {
    model: {
      type: String,
      enum: ['one-time', 'subscription', 'tier-based', 'pay-per-view', 'commission', 'revenue-share'],
      required: true
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    tiers: [{
      name: String,
      price: Number,
      features: [String],
      limits: {
        downloads: Number,
        views: Number,
        access: String
      }
    }],
    discounts: [{
      code: String,
      percentage: Number,
      amount: Number,
      validUntil: Date,
      usageLimit: Number,
      usedCount: { type: Number, default: 0 }
    }]
  },
  content: {
    type: String,
    enum: ['video', 'audio', 'text', 'image', 'download', 'access', 'service'],
    required: true
  },
  platforms: [String], // Where this revenue stream is active
  analytics: {
    totalRevenue: { type: Number, default: 0 },
    subscribers: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    lifetimeValue: { type: Number, default: 0 }
  },
  aiOptimization: {
    suggestedPricing: Number,
    priceTestResults: [{
      price: Number,
      conversionRate: Number,
      revenue: Number,
      testDuration: Number
    }],
    optimalTiming: {
      bestDays: [String],
      bestHours: [Number]
    },
    audienceRecommendations: [String]
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'testing', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Creator Marketplace Schema
const creatorMarketplaceSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['consulting', 'design', 'writing', 'video-editing', 'social-media-management', 'voice-over', 'photography', 'development', 'marketing', 'coaching'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  subcategory: String,
  pricing: {
    basePrice: Number,
    currency: { type: String, default: 'USD' },
    pricingType: {
      type: String,
      enum: ['fixed', 'hourly', 'per-project', 'tier-based'],
      required: true
    },
    packages: [{
      name: String,
      price: Number,
      deliverables: [String],
      timeline: String,
      revisions: Number
    }]
  },
  portfolio: [{
    title: String,
    description: String,
    mediaUrl: String,
    mediaType: String,
    clientTestimonial: String
  }],
  skills: [String],
  experience: {
    years: Number,
    industry: [String],
    previousClients: Number,
    completedProjects: Number
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    hoursPerWeek: Number,
    timezone: String,
    responseTime: String
  },
  ratings: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    breakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    }
  },
  orders: {
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  verification: {
    identity: { type: Boolean, default: false },
    skills: { type: Boolean, default: false },
    portfolio: { type: Boolean, default: false },
    badges: [String]
  }
}, {
  timestamps: true
});

// Smart Pricing Engine Schema
const smartPricingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  productType: String,
  marketAnalysis: {
    competitorPrices: [{
      competitor: String,
      price: Number,
      features: [String],
      marketShare: Number
    }],
    marketAverage: Number,
    priceRange: {
      min: Number,
      max: Number
    },
    demandLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'very-high']
    }
  },
  recommendations: {
    suggestedPrice: Number,
    confidence: Number,
    reasoning: [String],
    expectedConversionRate: Number,
    projectedRevenue: Number,
    priceElasticity: Number
  },
  abTests: [{
    testName: String,
    priceA: Number,
    priceB: Number,
    startDate: Date,
    endDate: Date,
    results: {
      priceAConversions: Number,
      priceBConversions: Number,
      priceARevenue: Number,
      priceBRevenue: Number,
      winner: String,
      confidence: Number
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'paused'],
      default: 'running'
    }
  }],
  dynamicPricing: {
    enabled: { type: Boolean, default: false },
    rules: [{
      condition: String,
      adjustment: Number,
      type: { type: String, enum: ['percentage', 'amount'] }
    }],
    currentMultiplier: { type: Number, default: 1 }
  },
  performance: {
    currentPrice: Number,
    conversionRate: Number,
    revenue: Number,
    units: Number,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Revenue Sharing Schema
const revenueSharingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partnerType: {
    type: String,
    enum: ['affiliate', 'collaborator', 'platform', 'sponsor'],
    required: true
  },
  partnerName: String,
  sharePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  revenueType: {
    type: String,
    enum: ['commission', 'royalty', 'ad-revenue', 'subscription', 'one-time'],
    required: true
  },
  terms: {
    minimumPayout: { type: Number, default: 0 },
    paymentSchedule: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    contractStart: Date,
    contractEnd: Date,
    autoRenew: { type: Boolean, default: false }
  },
  tracking: {
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    payout: { type: Number, default: 0 }
  },
  payoutHistory: [{
    amount: Number,
    date: Date,
    period: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    transactionId: String
  }]
}, {
  timestamps: true
});

// Creator Insurance Schema
const creatorInsuranceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    required: true
  },
  coverage: {
    copyrightProtection: { type: Boolean, default: false },
    trademarkProtection: { type: Boolean, default: false },
    defamationProtection: { type: Boolean, default: false },
    contractDisputes: { type: Boolean, default: false },
    equipmentCoverage: { type: Boolean, default: false },
    businessInterruption: { type: Boolean, default: false }
  },
  limits: {
    maxClaim: Number,
    annualLimit: Number,
    deductible: Number
  },
  premium: {
    monthly: Number,
    annual: Number,
    currency: { type: String, default: 'USD' }
  },
  claims: [{
    claimId: String,
    type: String,
    description: String,
    amount: Number,
    status: {
      type: String,
      enum: ['submitted', 'investigating', 'approved', 'denied', 'paid'],
      default: 'submitted'
    },
    submittedDate: Date,
    resolvedDate: Date,
    documents: [String]
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Export models
const RevenueStream = mongoose.model('RevenueStream', revenueStreamSchema);
const CreatorMarketplace = mongoose.model('CreatorMarketplace', creatorMarketplaceSchema);
const SmartPricing = mongoose.model('SmartPricing', smartPricingSchema);
const RevenueSharing = mongoose.model('RevenueSharing', revenueSharingSchema);
const CreatorInsurance = mongoose.model('CreatorInsurance', creatorInsuranceSchema);

module.exports = {
  RevenueStream,
  CreatorMarketplace,
  SmartPricing,
  RevenueSharing,
  CreatorInsurance
}; 