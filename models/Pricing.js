const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Plan title is required'],
    enum: ['Free', 'Pro', 'Enterprise'],
    unique: true
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  features: [{
    type: String,
    required: [true, 'Feature description is required']
  }],
  isRecommended: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    minMonthlyFee: Number,
    revenueSharePercentage: Number,
    maxUsers: Number,
    storageLimit: String,
    supportLevel: {
      type: String,
      enum: ['Standard', 'Priority', 'Premium']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
pricingSchema.index({ title: 1, isActive: 1 });

// Virtual for formatted price display
pricingSchema.virtual('displayPrice').get(function() {
  if (this.title === 'Pro') {
    return `$${this.percentage}`;
  }
  return `${this.percentage}%`;
});

// Static method to get active pricing plans
pricingSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort('sortOrder');
};

// Instance method to check if plan is enterprise
pricingSchema.methods.isEnterprise = function() {
  return this.title === 'Enterprise';
};

module.exports = mongoose.model('Pricing', pricingSchema); 