const mongoose = require('mongoose');

const productPurchaseHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    sales: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseTime: {
      type: Date,
      default: Date.now,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto'],
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'refunded'],
      default: 'completed',
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

module.exports = mongoose.model('ProductPurchaseHistory', productPurchaseHistorySchema); 