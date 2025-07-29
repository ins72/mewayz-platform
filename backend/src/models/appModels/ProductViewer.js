const mongoose = require('mongoose');

const productViewerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    device: {
      type: String,
      trim: true,
    },
    browser: {
      type: String,
      trim: true,
    },
    visitTime: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    pageViews: {
      type: Number,
      default: 1,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
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

module.exports = mongoose.model('ProductViewer', productViewerSchema); 