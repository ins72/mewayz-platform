const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    features: [{
      type: String,
      trim: true,
    }],
    price: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one-time'],
      default: 'monthly',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxProducts: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    maxPromotions: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    hasAnalytics: {
      type: Boolean,
      default: false,
    },
    hasBulkMessaging: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PricingPlan', pricingPlanSchema); 