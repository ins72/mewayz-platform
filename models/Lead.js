const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  lead_name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
    maxlength: [100, 'Lead name cannot exceed 100 characters']
  },
  company_name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  email_id: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  status: {
    type: String,
    enum: ['Open', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost', 'Unqualified'],
    default: 'Open'
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Social Media', 'Advertisement', 'Cold Call', 'Event', 'Email Campaign', 'Other'],
    default: 'Website'
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [50, 'Industry cannot exceed 50 characters']
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
  estimated_value: {
    type: Number,
    min: 0,
    default: 0
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  expected_close_date: {
    type: Date
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
    lead_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    last_contact_date: Date,
    next_follow_up: Date,
    contact_count: {
      type: Number,
      default: 0
    },
    employee_count: Number,
    annual_revenue: Number,
    decision_maker: {
      name: String,
      title: String,
      email: String,
      phone: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
leadSchema.index({ lead_name: 1, company_name: 1 });
leadSchema.index({ status: 1, isActive: 1 });
leadSchema.index({ source: 1, isActive: 1 });
leadSchema.index({ assigned_to: 1, isActive: 1 });
leadSchema.index({ 'metadata.next_follow_up': 1 });
leadSchema.index({ createdAt: -1 });

// Virtual for full address
leadSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zip_code, country } = this.address;
  return [street, city, state, zip_code, country].filter(Boolean).join(', ');
});

// Virtual for weighted value
leadSchema.virtual('weightedValue').get(function() {
  return (this.estimated_value * this.probability) / 100;
});

// Virtual for days since creation
leadSchema.virtual('daysSinceCreation').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to get active leads
leadSchema.statics.getActiveLeads = function() {
  return this.find({ 
    isActive: true, 
    status: { $nin: ['Converted', 'Lost', 'Unqualified'] } 
  });
};

// Static method to get leads by status
leadSchema.statics.getLeadsByStatus = function(status) {
  return this.find({ status, isActive: true });
};

// Static method to get leads by source
leadSchema.statics.getLeadsBySource = function(source) {
  return this.find({ source, isActive: true });
};

// Static method to search leads
leadSchema.statics.searchLeads = function(searchTerm) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { lead_name: { $regex: searchTerm, $options: 'i' } },
          { company_name: { $regex: searchTerm, $options: 'i' } },
          { email_id: { $regex: searchTerm, $options: 'i' } },
          { industry: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  });
};

// Static method to get leads requiring follow-up
leadSchema.statics.getLeadsRequiringFollowUp = function() {
  return this.find({
    isActive: true,
    status: { $nin: ['Converted', 'Lost', 'Unqualified'] },
    $or: [
      { 'metadata.next_follow_up': { $lte: new Date() } },
      { 'metadata.next_follow_up': { $exists: false } }
    ]
  });
};

// Instance method to update lead status
leadSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'Converted') {
    this.metadata.last_contact_date = new Date();
  }
  return this.save();
};

// Instance method to add contact
leadSchema.methods.addContact = function() {
  this.metadata.contact_count += 1;
  this.metadata.last_contact_date = new Date();
  return this.save();
};

// Instance method to schedule follow-up
leadSchema.methods.scheduleFollowUp = function(daysFromNow = 7) {
  this.metadata.next_follow_up = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return this.save();
};

// Pre-save middleware to update lead score based on activity
leadSchema.pre('save', function(next) {
  if (this.isModified('status') || this.isModified('estimated_value') || this.isModified('probability')) {
    let score = 0;
    
    // Base score from status
    const statusScores = {
      'Open': 10,
      'Contacted': 20,
      'Qualified': 40,
      'Proposal': 60,
      'Negotiation': 80,
      'Converted': 100
    };
    score += statusScores[this.status] || 0;
    
    // Add score from probability
    score += this.probability * 0.3;
    
    // Add score from estimated value (normalized)
    if (this.estimated_value > 0) {
      score += Math.min(this.estimated_value / 1000, 20); // Max 20 points from value
    }
    
    this.metadata.lead_score = Math.min(score, 100);
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema); 