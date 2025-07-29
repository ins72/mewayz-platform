const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    affiliateCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10, // 10% commission
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    paymentMethod: {
      type: String,
      enum: ['paypal', 'stripe', 'bank_transfer', 'crypto'],
      default: 'paypal',
    },
    paymentEmail: {
      type: String,
      trim: true,
    },
    minimumPayout: {
      type: Number,
      default: 50,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastPayout: {
      type: Date,
    },
    referralLink: {
      type: String,
      trim: true,
    },
    socialLinks: [{
      platform: {
        type: String,
        enum: ['twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'blog'],
      },
      url: {
        type: String,
        trim: true,
      },
    }],
    performance: {
      monthlyEarnings: [{
        month: String,
        amount: Number,
      }],
      topProducts: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        sales: Number,
        earnings: Number,
      }],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Affiliate', affiliateSchema); 