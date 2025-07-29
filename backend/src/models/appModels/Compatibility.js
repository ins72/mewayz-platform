const mongoose = require('mongoose');

const compatibilitySchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['design', 'development', '3d', 'productivity', 'cms', 'programming'],
      default: 'design',
    },
    description: {
      type: String,
      trim: true,
    },
    version: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    compatibilityLevel: {
      type: String,
      enum: ['full', 'partial', 'basic'],
      default: 'full',
    },
    requirements: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Compatibility', compatibilitySchema); 