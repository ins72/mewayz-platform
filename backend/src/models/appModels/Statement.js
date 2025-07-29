const mongoose = require('mongoose');

const statementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '/images/products/1.png',
    },
    type: {
      type: String,
      enum: ['paid', 'refund', 'pending', 'failed'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
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
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Statement', statementSchema); 