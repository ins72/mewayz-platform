const mongoose = require('mongoose');

const productActivitySchema = new mongoose.Schema(
  {
    week: {
      type: String,
      required: true,
      trim: true,
    },
    products: {
      counter: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    views: {
      counter: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    likes: {
      counter: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    comments: {
      counter: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
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

module.exports = mongoose.model('ProductActivity', productActivitySchema); 