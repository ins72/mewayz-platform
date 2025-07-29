const mongoose = require('mongoose');

const deviceAnalyticsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    icon: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['device', 'gender'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
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

module.exports = mongoose.model('DeviceAnalytics', deviceAnalyticsSchema); 