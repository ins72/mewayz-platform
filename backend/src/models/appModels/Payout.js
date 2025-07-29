const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['in progress', 'paid', 'succeeded', 'failed', 'cancelled'],
      default: 'in progress',
    },
    method: {
      type: String,
      enum: ['paypal', 'stripe', 'bank_transfer', 'crypto'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    net: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payout', payoutSchema); 