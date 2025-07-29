const mongoose = require('mongoose');

// Content Repurposing Schema
const contentRepurposingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalContent: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['blog-post', 'newsletter', 'article', 'video-script', 'podcast-transcript'],
    required: true
  },
  repurposedContent: [{
    platform: {
      type: String,
      enum: ['twitter', 'linkedin', 'instagram', 'tiktok', 'youtube', 'facebook'],
      required: true
    },
    content: String,
    contentFormat: {
      type: String,
      enum: ['tweet', 'thread', 'post', 'story', 'reel', 'short', 'video-script'],
      required: true
    },
    optimizedVersion: String,
    scheduledTime: Date,
    published: {
      type: Boolean,
      default: false
    },
    performance: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 }
    }
  }],
  aiSettings: {
    voiceStyle: {
      type: String,
      enum: ['professional', 'casual', 'humorous', 'educational', 'inspirational', 'custom'],
      default: 'professional'
    },
    customVoiceProfile: String, // Learned from user samples
    tone: {
      type: String,
      enum: ['formal', 'conversational', 'enthusiastic', 'authoritative', 'friendly'],
      default: 'conversational'
    },
    targetAudience: String,
    keyMessages: [String],
    brandGuidelines: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'scheduled'],
    default: 'processing'
  },
  processedAt: Date,
  analytics: {
    totalReach: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// AI Video Creation Schema
const aiVideoCreationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  inputType: {
    type: String,
    enum: ['text', 'script', 'blog-post', 'outline', 'topic'],
    required: true
  },
  inputContent: {
    type: String,
    required: true
  },
  videoSettings: {
    duration: {
      type: String,
      enum: ['15s', '30s', '60s', '90s', '3min', '5min', '10min', 'custom'],
      default: '60s'
    },
    format: {
      type: String,
      enum: ['square', 'vertical', 'horizontal', 'story'],
      default: 'vertical'
    },
    style: {
      type: String,
      enum: ['modern', 'minimal', 'corporate', 'creative', 'educational', 'entertainment'],
      default: 'modern'
    },
    voiceOver: {
      enabled: { type: Boolean, default: false },
      voice: { type: String, default: 'natural' },
      language: { type: String, default: 'en' }
    },
    music: {
      enabled: { type: Boolean, default: true },
      genre: { type: String, default: 'upbeat' },
      volume: { type: Number, default: 0.3 }
    },
    subtitles: {
      enabled: { type: Boolean, default: true },
      language: { type: String, default: 'en' },
      style: { type: String, default: 'modern' }
    }
  },
  brandAssets: {
    logo: String,
    colors: [String],
    fonts: [String],
    watermark: String
  },
  generatedVideo: {
    url: String,
    thumbnailUrl: String,
    duration: Number,
    fileSize: Number,
    resolution: String
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  analytics: {
    views: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Content Suggestions Schema
const contentSuggestionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: String,
  niche: String,
  targetAudience: String,
  suggestions: [{
    type: {
      type: String,
      enum: ['trending-topic', 'content-gap', 'viral-prediction', 'seo-opportunity', 'engagement-boost'],
      required: true
    },
    title: String,
    description: String,
    reasoning: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    estimatedViralScore: {
      type: Number,
      min: 0,
      max: 100
    },
    suggestedPlatforms: [String],
    keywords: [String],
    optimalTiming: {
      bestDays: [String],
      bestHours: [Number]
    },
    competitorAnalysis: {
      performingWell: [String],
      opportunities: [String]
    },
    contentIdeas: [String],
    dismissed: {
      type: Boolean,
      default: false
    },
    used: {
      type: Boolean,
      default: false
    },
    performance: {
      actualViews: Number,
      actualEngagement: Number,
      accuracyScore: Number
    }
  }],
  preferences: {
    contentTypes: [String],
    platforms: [String],
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly'],
      default: 'weekly'
    },
    excludeTopics: [String]
  },
  lastUpdated: Date
}, {
  timestamps: true
});

// Voice Profile Learning Schema
const voiceProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileName: {
    type: String,
    required: true
  },
  trainingSamples: [{
    content: String,
    contentType: String,
    platform: String,
    performance: {
      engagement: Number,
      reach: Number,
      sentiment: String
    }
  }],
  learnedPatterns: {
    vocabulary: [String],
    phrases: [String],
    tonalAttributes: [String],
    structuralPatterns: [String],
    humor: {
      style: String,
      frequency: Number
    },
    storytelling: {
      structure: String,
      hooks: [String]
    }
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['training', 'ready', 'updating'],
    default: 'training'
  },
  usage: {
    timesUsed: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    userFeedback: [{
      rating: Number,
      comment: String,
      date: Date
    }]
  }
}, {
  timestamps: true
});

// Export models
const ContentRepurposing = mongoose.model('ContentRepurposing', contentRepurposingSchema);
const AIVideoCreation = mongoose.model('AIVideoCreation', aiVideoCreationSchema);
const ContentSuggestions = mongoose.model('ContentSuggestions', contentSuggestionsSchema);
const VoiceProfile = mongoose.model('VoiceProfile', voiceProfileSchema);

module.exports = {
  ContentRepurposing,
  AIVideoCreation,
  ContentSuggestions,
  VoiceProfile
}; 