const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
    enum: ['twitter', 'facebook', 'instagram', 'threads', 'linkedin', 'youtube', 'tiktok'],
  },
  href: {
    type: String,
    required: true,
  },
});

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    socials: [socialLinkSchema],
    likes: {
      counter: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    views: {
      counter: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    conversationRate: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'paused', 'completed'],
      default: 'draft',
    },
    type: {
      type: String,
      enum: ['sale', 'announcement', 'product', 'event', 'newsletter'],
      default: 'sale',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    targetAudience: [{
      type: String,
      trim: true,
    }],
    platforms: [{
      type: String,
      enum: ['twitter', 'facebook', 'instagram', 'threads', 'linkedin', 'youtube', 'tiktok'],
    }],
    budget: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Promotion', promotionSchema); 