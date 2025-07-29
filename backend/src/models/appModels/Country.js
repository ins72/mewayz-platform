const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    flag: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalCustomers: {
      type: Number,
      default: 0,
    },
    totalOrders: {
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

module.exports = mongoose.model('Country', countrySchema); 