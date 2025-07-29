const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      trim: true,
    },
    counter: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
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
        required: true,
        min: 0,
      },
    }],
    type: {
      type: String,
      enum: ['balance', 'payout', 'earnings', 'revenue'],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Income', incomeSchema); 