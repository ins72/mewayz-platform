const mongoose = require('mongoose');

const productTrafficSourceSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

module.exports = mongoose.model('ProductTrafficSource', productTrafficSourceSchema); 