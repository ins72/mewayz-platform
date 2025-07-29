const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
    enum: ['twitter', 'instagram', 'threads', 'linkedin', 'youtube', 'facebook'],
  },
  href: {
    type: String,
    required: true,
  },
});

const shopItemSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  title: {
    type: String,
    trim: true,
  },
});

const creatorSchema = new mongoose.Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '/images/avatar.png',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    time: {
      type: String,
      trim: true,
    },
    shop: [shopItemSchema],
    socials: [socialLinkSchema],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Creator', creatorSchema); 