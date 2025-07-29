const mongoose = require('mongoose');

const productShareSchema = new mongoose.Schema(
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
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    shareType: {
      type: String,
      enum: ['social', 'email', 'link', 'embed'],
      default: 'social',
    },
    platform: {
      type: String,
      enum: ['twitter', 'facebook', 'instagram', 'linkedin', 'pinterest', 'other'],
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model('ProductShare', productShareSchema); 