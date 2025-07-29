const mongoose = require('mongoose');

// AI Design Studio Schema
const aiDesignStudioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  designType: {
    type: String,
    enum: ['logo', 'banner', 'social-media-graphic', 'business-card', 'flyer', 'poster', 'infographic', 'presentation', 'web-graphic', 'print-design'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  specifications: {
    dimensions: {
      width: Number,
      height: Number,
      unit: { type: String, enum: ['px', 'in', 'cm', 'mm'], default: 'px' }
    },
    format: {
      type: String,
      enum: ['PNG', 'JPG', 'SVG', 'PDF', 'AI', 'PSD'],
      default: 'PNG'
    },
    colorMode: {
      type: String,
      enum: ['RGB', 'CMYK', 'Grayscale'],
      default: 'RGB'
    },
    resolution: {
      type: Number,
      default: 300 // DPI
    }
  },
  stylePreferences: {
    style: {
      type: String,
      enum: ['modern', 'minimalist', 'vintage', 'corporate', 'creative', 'elegant', 'bold', 'playful'],
      default: 'modern'
    },
    colorScheme: [String], // Hex color codes
    typography: {
      primaryFont: String,
      secondaryFont: String,
      fontStyle: { type: String, enum: ['serif', 'sans-serif', 'script', 'display'] }
    },
    mood: {
      type: String,
      enum: ['professional', 'friendly', 'energetic', 'calm', 'luxury', 'fun', 'serious', 'innovative']
    }
  },
  brandGuidelines: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrandKit'
  },
  generatedDesigns: [{
    version: Number,
    imageUrl: String,
    vectorUrl: String,
    thumbnailUrl: String,
    variations: [{
      variationName: String,
      imageUrl: String,
      description: String
    }],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      improvements: [String]
    },
    usage: {
      downloaded: { type: Boolean, default: false },
      downloadedAt: Date,
      usedInProjects: [String]
    }
  }],
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'revision-requested'],
    default: 'generating'
  },
  generationProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  revisionHistory: [{
    revisionPrompt: String,
    changes: [String],
    timestamp: Date,
    resultUrl: String
  }]
}, {
  timestamps: true
});

// Brand Kit Management Schema
const brandKitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  logo: {
    primary: {
      url: String,
      format: String,
      variations: [{
        name: String, // light, dark, monochrome, etc.
        url: String
      }]
    },
    secondary: {
      url: String,
      variations: [{
        name: String,
        url: String
      }]
    },
    favicon: String
  },
  colorPalette: {
    primary: [{
      name: String, // Brand Primary, Brand Secondary, etc.
      hex: String,
      rgb: String,
      cmyk: String,
      pantone: String
    }],
    secondary: [{
      name: String,
      hex: String,
      rgb: String
    }],
    neutral: [{
      name: String,
      hex: String,
      rgb: String
    }]
  },
  typography: {
    headings: {
      fontFamily: String,
      fontWeight: String,
      fontSize: {
        h1: String,
        h2: String,
        h3: String,
        h4: String,
        h5: String,
        h6: String
      }
    },
    body: {
      fontFamily: String,
      fontSize: String,
      lineHeight: String,
      fontWeight: String
    },
    accent: {
      fontFamily: String,
      usage: String // for quotes, captions, etc.
    }
  },
  imagery: {
    style: String, // photography style guidelines
    filters: [String], // preferred filters/effects
    composition: String, // composition guidelines
    subjects: [String], // preferred subject matters
    restrictions: [String] // what to avoid
  },
  voiceAndTone: {
    personality: [String], // friendly, professional, innovative, etc.
    toneAttributes: [String], // warm, authoritative, playful, etc.
    doList: [String], // what to do
    dontList: [String], // what to avoid
    examplePhrases: [String]
  },
  templates: [{
    templateType: String,
    templateUrl: String,
    description: String,
    lastUsed: Date
  }],
  usage: {
    timesApplied: { type: Number, default: 0 },
    lastUsed: Date,
    consistency: {
      score: { type: Number, min: 0, max: 100 },
      checkedAt: Date
    }
  }
}, {
  timestamps: true
});

// Template Library Schema
const templateLibrarySchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['social-media', 'business', 'marketing', 'presentation', 'print', 'web', 'e-commerce', 'education'],
    required: true
  },
  subcategory: String,
  designType: {
    type: String,
    enum: ['instagram-post', 'facebook-cover', 'linkedin-banner', 'business-card', 'flyer', 'logo', 'website-banner', 'email-header'],
    required: true
  },
  preview: {
    thumbnailUrl: String,
    previewUrl: String,
    mockupUrl: String
  },
  specifications: {
    dimensions: {
      width: Number,
      height: Number
    },
    format: [String],
    colorMode: String
  },
  customizationOptions: {
    editableElements: [String], // text, images, colors, etc.
    colorCustomizable: Boolean,
    fontCustomizable: Boolean,
    layoutCustomizable: Boolean
  },
  popularity: {
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 }
  },
  tags: [String],
  isPremium: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: 'MEWAYZ'
  }
}, {
  timestamps: true
});

// Creative Asset Library Schema
const creativeAssetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assetName: {
    type: String,
    required: true
  },
  assetType: {
    type: String,
    enum: ['image', 'vector', 'icon', 'illustration', 'pattern', 'texture', 'font', 'audio', 'video', 'template'],
    required: true
  },
  category: String,
  tags: [String],
  fileInfo: {
    originalUrl: String,
    processedUrl: String,
    thumbnailUrl: String,
    fileSize: Number,
    format: String,
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number // for audio/video
  },
  licensing: {
    type: {
      type: String,
      enum: ['royalty-free', 'creative-commons', 'custom', 'purchased', 'created'],
      required: true
    },
    source: String,
    restrictions: [String],
    creditRequired: Boolean,
    commercialUse: Boolean
  },
  metadata: {
    description: String,
    keywords: [String],
    colorDominant: [String],
    style: String,
    mood: String,
    aiGenerated: Boolean
  },
  usage: {
    timesUsed: { type: Number, default: 0 },
    usedInProjects: [{
      projectId: String,
      projectName: String,
      usedAt: Date
    }],
    lastUsed: Date
  },
  collaboration: {
    sharedWith: [{
      userId: mongoose.Schema.Types.ObjectId,
      permission: { type: String, enum: ['view', 'edit', 'download'] }
    }],
    isPublic: Boolean,
    teamFolder: String
  },
  versions: [{
    versionNumber: Number,
    url: String,
    changes: String,
    createdAt: Date
  }]
}, {
  timestamps: true
});

// Photo Enhancement Schema
const photoEnhancementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalImage: {
    url: String,
    filename: String,
    fileSize: Number,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  enhancements: {
    autoEnhance: Boolean,
    brightnessAdjustment: Number,
    contrastAdjustment: Number,
    saturationAdjustment: Number,
    sharpnessAdjustment: Number,
    noiseReduction: Boolean,
    colorCorrection: Boolean,
    backgroundRemoval: Boolean,
    resizeOptions: {
      newWidth: Number,
      newHeight: Number,
      maintainAspectRatio: Boolean
    },
    filters: [String],
    effects: [String]
  },
  enhancedImages: [{
    preset: String,
    url: String,
    thumbnailUrl: String,
    appliedEnhancements: [String],
    processingTime: Number
  }],
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  processingTime: Number,
  feedback: {
    rating: Number,
    improvements: [String]
  }
}, {
  timestamps: true
});

// Vector Graphics Creation Schema
const vectorGraphicsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  graphicType: {
    type: String,
    enum: ['icon', 'illustration', 'logo', 'pattern', 'infographic-element', 'symbol'],
    required: true
  },
  description: String,
  style: {
    type: String,
    enum: ['flat', 'line-art', 'outline', 'filled', 'gradient', 'hand-drawn', 'geometric'],
    default: 'flat'
  },
  specifications: {
    artboardSize: {
      width: Number,
      height: Number
    },
    strokeWidth: Number,
    cornerRadius: Number,
    colorLimited: Boolean,
    maxColors: Number
  },
  generatedVectors: [{
    version: Number,
    svgUrl: String,
    pngUrl: String,
    aiUrl: String, // Adobe Illustrator format
    previewUrl: String,
    complexity: String, // simple, medium, complex
    colors: [String],
    scalability: Boolean
  }],
  editingHistory: [{
    action: String,
    timestamp: Date,
    resultUrl: String
  }],
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  }
}, {
  timestamps: true
});

// Export models
const AIDesignStudio = mongoose.model('AIDesignStudio', aiDesignStudioSchema);
const BrandKit = mongoose.model('BrandKit', brandKitSchema);
const TemplateLibrary = mongoose.model('TemplateLibrary', templateLibrarySchema);
const CreativeAsset = mongoose.model('CreativeAsset', creativeAssetSchema);
const PhotoEnhancement = mongoose.model('PhotoEnhancement', photoEnhancementSchema);
const VectorGraphics = mongoose.model('VectorGraphics', vectorGraphicsSchema);

module.exports = {
  AIDesignStudio,
  BrandKit,
  TemplateLibrary,
  CreativeAsset,
  PhotoEnhancement,
  VectorGraphics
}; 