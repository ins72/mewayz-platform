const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    tooltip: {
      type: String,
      trim: true,
    },
    newCustomers: {
      type: Number,
      default: 0,
    },
    productReached: {
      type: Number,
      default: 0,
    },
    dataChart: [{
      name: {
        type: String,
        required: true,
      },
      amt: {
        type: Number,
        default: 0,
      },
      amt2: {
        type: Number,
        default: 0,
      },
      amt3: {
        type: Number,
        default: 0,
      },
    }],
    type: {
      type: String,
      enum: ['views', 'engagement', 'sales', 'revenue', 'customers', 'conversion'],
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
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
    category: {
      type: String,
      enum: ['promotion', 'affiliate', 'general', 'product'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Insight', insightSchema); 