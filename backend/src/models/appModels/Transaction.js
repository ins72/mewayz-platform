const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'refund', 'payout', 'commission'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto'],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

// Index for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ status: 1, date: -1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ transactionId: 1 });

// Virtual for net amount (amount - fees)
transactionSchema.virtual('netAmount').get(function() {
  return this.amount - this.fees;
});

// Ensure virtual fields are serialized
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema); 