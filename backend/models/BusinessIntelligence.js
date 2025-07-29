const mongoose = require('mongoose');

// Competitive Intelligence Schema
const competitiveIntelligenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: String,
  competitorList: [{
    name: String,
    website: String,
    socialProfiles: {
      twitter: String,
      linkedin: String,
      instagram: String,
      tiktok: String,
      youtube: String,
      facebook: String
    },
    businessType: String,
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    isDirectCompetitor: Boolean,
    addedAt: Date
  }],
  monitoringSettings: {
    trackContent: Boolean,
    trackPricing: Boolean,
    trackProducts: Boolean,
    trackSocialMedia: Boolean,
    trackSEO: Boolean,
    trackAds: Boolean,
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    notifications: Boolean
  },
  analyticsData: [{
    competitorId: String,
    period: Date,
    metrics: {
      socialMedia: {
        followers: Number,
        engagement: Number,
        postFrequency: Number,
        topContent: [String],
        hashtagUsage: [String]
      },
      content: {
        blogPosts: Number,
        videoContent: Number,
        topics: [String],
        contentQuality: Number,
        seoScore: Number
      },
      products: {
        newLaunches: [String],
        pricingChanges: [String],
        features: [String],
        customerReviews: Number
      },
      marketing: {
        adSpend: Number,
        campaigns: [String],
        channels: [String],
        messaging: [String]
      },
      performance: {
        webTraffic: Number,
        searchRankings: [String],
        backlinks: Number,
        mentions: Number
      }
    }
  }],
  insights: [{
    type: { type: String, enum: ['opportunity', 'threat', 'trend', 'gap'] },
    title: String,
    description: String,
    competitorInvolved: String,
    impact: { type: String, enum: ['low', 'medium', 'high'] },
    urgency: { type: String, enum: ['low', 'medium', 'high'] },
    recommendation: String,
    evidence: [String],
    createdAt: Date,
    status: { type: String, enum: ['new', 'reviewing', 'acting', 'completed'], default: 'new' }
  }],
  reports: [{
    reportType: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'custom'] },
    generatedAt: Date,
    reportUrl: String,
    keyFindings: [String],
    actionItems: [String]
  }]
}, {
  timestamps: true
});

// Market Intelligence Schema
const marketIntelligenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: String,
  targetMarkets: [String],
  researchTopics: [String],
  marketData: {
    industrySize: {
      value: Number,
      currency: String,
      year: Number,
      source: String
    },
    growthRate: {
      annual: Number,
      projected: Number,
      period: String
    },
    keyPlayers: [{
      name: String,
      marketShare: Number,
      revenue: Number,
      strengths: [String],
      weaknesses: [String]
    }],
    trends: [{
      trend: String,
      impact: String,
      timeline: String,
      confidence: Number,
      sources: [String]
    }],
    customerSegments: [{
      segment: String,
      size: Number,
      characteristics: [String],
      needs: [String],
      painPoints: [String]
    }]
  },
  marketOpportunities: [{
    opportunity: String,
    description: String,
    marketSize: Number,
    difficulty: { type: String, enum: ['low', 'medium', 'high'] },
    timeToMarket: String,
    investmentRequired: Number,
    expectedROI: Number,
    riskFactors: [String],
    nextSteps: [String],
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
  }],
  sentimentAnalysis: {
    overallSentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    brandMentions: [{
      platform: String,
      mentions: Number,
      sentiment: String,
      topics: [String],
      influencers: [String]
    }],
    industryMentions: [{
      topic: String,
      volume: Number,
      sentiment: String,
      trendDirection: String
    }]
  },
  predictiveInsights: [{
    prediction: String,
    confidence: Number,
    timeframe: String,
    impactArea: String,
    recommendation: String,
    dataPoints: [String]
  }]
}, {
  timestamps: true
});

// Predictive Analytics Schema
const predictiveAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modelType: {
    type: String,
    enum: ['sales-forecasting', 'customer-churn', 'lifetime-value', 'demand-prediction', 'price-optimization', 'trend-analysis'],
    required: true
  },
  dataSource: {
    type: String,
    enum: ['internal', 'external', 'combined'],
    required: true
  },
  trainingData: {
    startDate: Date,
    endDate: Date,
    recordCount: Number,
    features: [String],
    qualityScore: Number
  },
  model: {
    algorithm: String,
    accuracy: Number,
    precision: Number,
    recall: Number,
    lastTrained: Date,
    version: String,
    status: { type: String, enum: ['training', 'ready', 'updating', 'deprecated'] }
  },
  predictions: [{
    predictionDate: Date,
    forecastPeriod: String,
    predictions: [{
      metric: String,
      predictedValue: Number,
      confidence: Number,
      upperBound: Number,
      lowerBound: Number,
      actualValue: Number, // filled in later for accuracy tracking
      variance: Number
    }],
    factors: [{
      factor: String,
      impact: Number,
      direction: { type: String, enum: ['positive', 'negative', 'neutral'] }
    }],
    recommendations: [String]
  }],
  performance: {
    accuracy: Number,
    mape: Number, // Mean Absolute Percentage Error
    rmse: Number, // Root Mean Square Error
    trend: { type: String, enum: ['improving', 'stable', 'declining'] },
    lastEvaluation: Date
  },
  alerts: [{
    alertType: { type: String, enum: ['anomaly', 'threshold', 'trend-change'] },
    message: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    triggeredAt: Date,
    resolved: Boolean,
    actions: [String]
  }]
}, {
  timestamps: true
});

// Customer Insights Schema
const customerInsightsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  segmentationCriteria: {
    demographic: [String],
    behavioral: [String],
    psychographic: [String],
    geographic: [String]
  },
  customerSegments: [{
    segmentName: String,
    description: String,
    size: Number,
    characteristics: [{
      attribute: String,
      value: String,
      percentage: Number
    }],
    behavior: {
      averageOrderValue: Number,
      purchaseFrequency: Number,
      preferredChannels: [String],
      engagementLevel: String,
      churnRisk: Number
    },
    preferences: {
      products: [String],
      contentTypes: [String],
      communicationChannels: [String],
      timing: [String]
    },
    value: {
      lifetimeValue: Number,
      acquisitionCost: Number,
      profitability: Number,
      growthPotential: Number
    },
    recommendations: [String]
  }],
  journeyMapping: [{
    stage: { type: String, enum: ['awareness', 'consideration', 'purchase', 'retention', 'advocacy'] },
    touchpoints: [String],
    painPoints: [String],
    emotions: [String],
    actions: [String],
    opportunities: [String],
    metrics: [{
      metric: String,
      value: Number,
      benchmark: Number
    }]
  }],
  churnAnalysis: {
    churnRate: Number,
    atRiskCustomers: Number,
    churnFactors: [{
      factor: String,
      importance: Number,
      correlation: Number
    }],
    retentionStrategies: [String],
    predictiveModel: {
      accuracy: Number,
      features: [String],
      lastUpdated: Date
    }
  },
  satisfactionMetrics: {
    nps: Number,
    csat: Number,
    ces: Number,
    trends: [{
      period: String,
      nps: Number,
      csat: Number,
      ces: Number
    }],
    feedback: [{
      source: String,
      sentiment: String,
      topics: [String],
      count: Number
    }]
  }
}, {
  timestamps: true
});

// Industry Benchmarking Schema
const industryBenchmarkingSchema = new mongoose.Schema({
  industry: String,
  subIndustry: String,
  benchmarks: [{
    metric: String,
    category: String,
    value: Number,
    unit: String,
    percentile25: Number,
    percentile50: Number,
    percentile75: Number,
    percentile90: Number,
    topPerformer: Number,
    dataSource: String,
    lastUpdated: Date,
    sampleSize: Number
  }],
  comparisons: [{
    userId: mongoose.Schema.Types.ObjectId,
    userValue: Number,
    benchmarkValue: Number,
    percentile: Number,
    gap: Number,
    performance: { type: String, enum: ['below', 'at', 'above'] },
    recommendations: [String]
  }],
  trends: [{
    metric: String,
    direction: { type: String, enum: ['increasing', 'decreasing', 'stable'] },
    change: Number,
    period: String,
    factors: [String]
  }],
  insights: [{
    type: { type: String, enum: ['opportunity', 'warning', 'best-practice'] },
    title: String,
    description: String,
    impact: String,
    actionable: [String]
  }]
}, {
  timestamps: true
});

// Data Visualization Dashboard Schema
const dataVisualizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dashboardName: {
    type: String,
    required: true
  },
  category: String,
  isDefault: Boolean,
  layout: {
    columns: Number,
    rows: Number,
    widgets: [{
      id: String,
      type: { type: String, enum: ['chart', 'table', 'metric', 'map', 'text', 'image'] },
      position: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      config: {
        title: String,
        dataSource: String,
        chartType: String,
        metrics: [String],
        filters: [String],
        timeRange: String,
        refreshRate: Number
      },
      styling: {
        backgroundColor: String,
        borderColor: String,
        textColor: String,
        fontSize: String
      }
    }]
  },
  dataSources: [{
    sourceId: String,
    sourceName: String,
    sourceType: String,
    connection: String,
    lastSync: Date,
    status: String
  }],
  sharing: {
    isPublic: Boolean,
    sharedWith: [{
      userId: mongoose.Schema.Types.ObjectId,
      permission: String
    }],
    embedCode: String
  },
  automation: {
    autoRefresh: Boolean,
    refreshInterval: Number,
    scheduledReports: [{
      frequency: String,
      recipients: [String],
      format: String
    }]
  }
}, {
  timestamps: true
});

// Export models
const CompetitiveIntelligence = mongoose.model('CompetitiveIntelligence', competitiveIntelligenceSchema);
const MarketIntelligence = mongoose.model('MarketIntelligence', marketIntelligenceSchema);
const PredictiveAnalytics = mongoose.model('PredictiveAnalytics', predictiveAnalyticsSchema);
const CustomerInsights = mongoose.model('CustomerInsights', customerInsightsSchema);
const IndustryBenchmarking = mongoose.model('IndustryBenchmarking', industryBenchmarkingSchema);
const DataVisualization = mongoose.model('DataVisualization', dataVisualizationSchema);

module.exports = {
  CompetitiveIntelligence,
  MarketIntelligence,
  PredictiveAnalytics,
  CustomerInsights,
  IndustryBenchmarking,
  DataVisualization
}; 