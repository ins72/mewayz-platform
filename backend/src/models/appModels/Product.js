const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
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
    },
    active: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ active: 1, category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema); 