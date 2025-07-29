const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customer_type: {
    type: String,
    required: [true, 'Customer type is required'],
    enum: ['Individual', 'Company', 'Enterprise', 'Partner'],
    default: 'Individual'
  },
  email_id: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  company_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    country: {
      type: String,
      default: 'United States'
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Prospect', 'Lead', 'Customer', 'Churned'],
    default: 'Prospect'
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Social Media', 'Advertisement', 'Cold Call', 'Event', 'Other'],
    default: 'Website'
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free'
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  last_purchase_date: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    industry: String,
    employee_count: Number,
    annual_revenue: Number,
    lead_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    last_contact_date: Date,
    next_follow_up: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
customerSchema.index({ customer_name: 1, email_id: 1 });
customerSchema.index({ status: 1, isActive: 1 });
customerSchema.index({ plan: 1, isActive: 1 });
customerSchema.index({ 'metadata.industry': 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zip_code, country } = this.address;
  return [street, city, state, zip_code, country].filter(Boolean).join(', ');
});

// Virtual for customer lifetime value
customerSchema.virtual('lifetimeValue').get(function() {
  return this.revenue || 0;
});

// Static method to get active customers
customerSchema.statics.getActiveCustomers = function() {
  return this.find({ isActive: true, status: { $in: ['Active', 'Customer'] } });
};

// Static method to get customers by plan
customerSchema.statics.getCustomersByPlan = function(plan) {
  return this.find({ plan, isActive: true });
};

// Static method to search customers
customerSchema.statics.searchCustomers = function(searchTerm) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { customer_name: { $regex: searchTerm, $options: 'i' } },
          { email_id: { $regex: searchTerm, $options: 'i' } },
          { company_name: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance method to update customer status
customerSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'Customer') {
    this.last_purchase_date = new Date();
  }
  return this.save();
};

// Instance method to add revenue
customerSchema.methods.addRevenue = function(amount) {
  this.revenue += amount;
  this.last_purchase_date = new Date();
  return this.save();
};

// Pre-save middleware to update lead score based on activity
customerSchema.pre('save', function(next) {
  if (this.isModified('status') || this.isModified('revenue')) {
    let score = 0;
    
    // Base score from status
    const statusScores = {
      'Prospect': 10,
      'Lead': 30,
      'Customer': 70,
      'Active': 80
    };
    score += statusScores[this.status] || 0;
    
    // Add score from revenue
    if (this.revenue > 0) {
      score += Math.min(this.revenue / 100, 20); // Max 20 points from revenue
    }
    
    this.metadata.lead_score = Math.min(score, 100);
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema); 