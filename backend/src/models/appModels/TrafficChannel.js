const mongoose = require('mongoose');

const trafficChannelSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    direct: {
      type: Number,
      default: 0,
    },
    search: {
      type: Number,
      default: 0,
    },
    social: {
      type: Number,
      default: 0,
    },
    referral: {
      type: Number,
      default: 0,
    },
    email: {
      type: Number,
      default: 0,
    },
    other: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
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

module.exports = mongoose.model('TrafficChannel', trafficChannelSchema); 