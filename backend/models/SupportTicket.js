const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  ticketNumber: {
    type: String,
    required: [true, 'Ticket number is required'],
    unique: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [255, 'Subject cannot exceed 255 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_for_customer', 'waiting_for_third_party', 'resolved', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  estimatedResolutionTime: {
    type: Number // in hours
  },
  actualResolutionTime: {
    type: Number // in hours
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'audio', 'other'],
      required: true
    },
    url: {
      type: String,
      trim: true
    },
    size: {
      type: Number // in bytes
    }
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  sla: {
    type: {
      type: String,
      enum: ['response_time', 'resolution_time', 'both'],
      default: 'both'
    },
    responseTime: {
      type: Number, // in hours
      default: 24
    },
    resolutionTime: {
      type: Number, // in hours
      default: 72
    },
    breached: {
      type: Boolean,
      default: false
    },
    breachedAt: {
      type: Date
    }
  },
  satisfaction: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    feedback: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    }
  },
  internalNotes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  activities: [{
    action: {
      type: String,
      required: true,
      enum: ['created', 'assigned', 'status_changed', 'priority_changed', 'commented', 'resolved', 'closed', 'reopened']
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  relatedTickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket'
  }],
  knowledgeBaseArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  }],
  escalationLevel: {
    type: Number,
    default: 1,
    min: [1, 'Escalation level must be at least 1'],
    max: [5, 'Escalation level cannot exceed 5']
  },
  escalatedAt: {
    type: Date
  },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalationReason: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String,
    trim: true
  },
  closedAt: {
    type: Date
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
supportTicketSchema.index({ organizationId: 1 });
// Note: ticketNumber index is handled by unique: true in schema definition
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ requester: 1 });
supportTicketSchema.index({ assignee: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ dueDate: 1 });
supportTicketSchema.index({ 'sla.breached': 1 });

// Compound indexes
supportTicketSchema.index({ organizationId: 1, status: 1 });
supportTicketSchema.index({ organizationId: 1, priority: 1 });
supportTicketSchema.index({ organizationId: 1, assignee: 1 });
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ assignee: 1, status: 1 });

// Text search index
supportTicketSchema.index({
  subject: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for ticket URL
supportTicketSchema.virtual('ticketUrl').get(function() {
  return `/support/tickets/${this.ticketNumber}`;
});

// Virtual for time to resolution
supportTicketSchema.virtual('timeToResolution').get(function() {
  if (!this.resolvedAt || !this.createdAt) return null;
  return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60 * 60)); // hours
});

// Virtual for time since last activity
supportTicketSchema.virtual('timeSinceLastActivity').get(function() {
  if (!this.activities || this.activities.length === 0) return null;
  const lastActivity = this.activities[this.activities.length - 1];
  return Math.round((new Date() - lastActivity.timestamp) / (1000 * 60 * 60)); // hours
});

// Virtual for requester info
supportTicketSchema.virtual('requesterInfo', {
  ref: 'User',
  localField: 'requester',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignee info
supportTicketSchema.virtual('assigneeInfo', {
  ref: 'User',
  localField: 'assignee',
  foreignField: '_id',
  justOne: true
});

// Virtual for organization info
supportTicketSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
supportTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate ticket number if not provided
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.ticketNumber = `TKT-${timestamp}-${random}`;
  }
  
  // Set assignedAt when assignee changes
  if (this.isModified('assignee') && this.assignee) {
    this.assignedAt = new Date();
  }
  
  // Set resolvedAt when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  // Set closedAt when status changes to closed
  if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  }
  
  // Calculate actual resolution time
  if (this.resolvedAt && this.createdAt) {
    this.actualResolutionTime = Math.round((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
  }
  
  // Check SLA breach
  if (this.sla && !this.sla.breached) {
    const now = new Date();
    const responseDeadline = new Date(this.createdAt.getTime() + (this.sla.responseTime * 60 * 60 * 1000));
    const resolutionDeadline = new Date(this.createdAt.getTime() + (this.sla.resolutionTime * 60 * 60 * 1000));
    
    if ((this.sla.type === 'response_time' || this.sla.type === 'both') && 
        now > responseDeadline && 
        this.activities.filter(a => a.action === 'assigned').length === 0) {
      this.sla.breached = true;
      this.sla.breachedAt = now;
    }
    
    if ((this.sla.type === 'resolution_time' || this.sla.type === 'both') && 
        now > resolutionDeadline && 
        this.status !== 'resolved' && 
        this.status !== 'closed') {
      this.sla.breached = true;
      this.sla.breachedAt = now;
    }
  }
  
  next();
});

// Static methods
supportTicketSchema.statics.findByStatus = function(organizationId, status) {
  return this.find({ organizationId, status });
};

supportTicketSchema.statics.findByAssignee = function(organizationId, assigneeId) {
  return this.find({ organizationId, assignee: assigneeId });
};

supportTicketSchema.statics.findOverdue = function(organizationId) {
  return this.find({
    organizationId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['resolved', 'closed'] }
  });
};

supportTicketSchema.statics.findSLABreached = function(organizationId) {
  return this.find({
    organizationId,
    'sla.breached': true,
    status: { $nin: ['resolved', 'closed'] }
  });
};

supportTicketSchema.statics.getStats = function(organizationId) {
  return this.aggregate([
    { $match: { organizationId: mongoose.Types.ObjectId(organizationId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        averageResolutionTime: { $avg: '$actualResolutionTime' }
      }
    }
  ]);
};

// Instance methods
supportTicketSchema.methods.addActivity = function(action, description, user, metadata = {}) {
  this.activities.push({
    action,
    description,
    user,
    timestamp: new Date(),
    metadata
  });
  return this.save();
};

supportTicketSchema.methods.addInternalNote = function(content, author, isPrivate = true) {
  this.internalNotes.push({
    content,
    author,
    isPrivate,
    createdAt: new Date()
  });
  return this.save();
};

supportTicketSchema.methods.escalate = function(level, reason, escalatedBy) {
  this.escalationLevel = level;
  this.escalatedAt = new Date();
  this.escalatedBy = escalatedBy;
  this.escalationReason = reason;
  return this.save();
};

supportTicketSchema.methods.updateSatisfaction = function(rating, feedback) {
  this.satisfaction = {
    rating,
    feedback,
    submittedAt: new Date()
  };
  return this.save();
};

// Error handling middleware
supportTicketSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Ticket with this number already exists'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema); 