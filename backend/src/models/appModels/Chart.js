const mongoose = require('mongoose');

const chartDataPointSchema = new mongoose.Schema({
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
  value: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
});

const chartSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['balance', 'product_views', 'customer_overview', 'revenue', 'sales', 'custom'],
      required: true,
    },
    data: [chartDataPointSchema],
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chart', chartSchema); 