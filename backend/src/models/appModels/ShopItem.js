const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    fileSize: {
      type: Number, // in bytes
    },
    fileType: {
      type: String,
      trim: true,
    },
    license: {
      type: String,
      enum: ['personal', 'commercial', 'extended'],
      default: 'personal',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShopItem', shopItemSchema); 