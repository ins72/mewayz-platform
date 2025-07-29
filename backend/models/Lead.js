const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, 'First name is required'], 
        trim: true, 
        maxlength: [50, 'First name cannot exceed 50 characters'] 
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'], 
        trim: true, 
        maxlength: [50, 'Last name cannot exceed 50 characters'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        lowercase: true, 
        trim: true, 
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] 
    },
    phone: { 
        type: String, 
        trim: true 
    },
    company: { 
        type: String, 
        maxlength: [100, 'Company name cannot exceed 100 characters'] 
    },
    jobTitle: { 
        type: String, 
        maxlength: [100, 'Job title cannot exceed 100 characters'] 
    },
    status: { 
        type: String, 
        enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'], 
        default: 'new' 
    },
    source: { 
        type: String, 
        enum: ['website', 'referral', 'social', 'email', 'event', 'cold_call', 'other'], 
        default: 'website' 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'], 
        default: 'medium' 
    },
    estimatedValue: { 
        type: Number, 
        min: [0, 'Estimated value cannot be negative'] 
    },
    expectedCloseDate: { 
        type: Date 
    },
    tags: [{ 
        type: String, 
        trim: true 
    }],
    notes: { 
        type: String, 
        maxlength: [2000, 'Notes cannot exceed 2000 characters'] 
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    socialMedia: {
        linkedin: String,
        twitter: String,
        facebook: String,
        instagram: String
    },
    activities: [{
        type: { 
            type: String, 
            enum: ['call', 'email', 'meeting', 'proposal', 'follow_up', 'other'] 
        },
        description: String,
        date: { 
            type: Date, 
            default: Date.now 
        },
        outcome: String,
        nextAction: String,
        nextActionDate: Date
    }],
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    lastContactDate: { 
        type: Date, 
        default: Date.now 
    },
    leadScore: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 100 
    }
}, { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

// Virtuals
leadSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

leadSchema.virtual('isActive').get(function() {
    return ['new', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(this.status);
});

leadSchema.virtual('isWon').get(function() {
    return this.status === 'won';
});

leadSchema.virtual('isLost').get(function() {
    return this.status === 'lost';
});

// Indexes
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ company: 1 });
leadSchema.index({ createdBy: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ 'estimatedValue': -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ lastContactDate: -1 });

// Pre-save middleware
leadSchema.pre('save', function(next) {
    // Update last contact date when activities are added
    if (this.activities && this.activities.length > 0) {
        const latestActivity = this.activities.reduce((latest, activity) => 
            activity.date > latest.date ? activity : latest
        );
        this.lastContactDate = latestActivity.date;
    }
    next();
});

// Static methods
leadSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

leadSchema.statics.findByPriority = function(priority) {
    return this.find({ priority });
};

leadSchema.statics.findBySource = function(source) {
    return this.find({ source });
};

leadSchema.statics.getLeadStats = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                newLeads: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
                contactedLeads: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
                qualifiedLeads: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
                proposalLeads: { $sum: { $cond: [{ $eq: ['$status', 'proposal'] }, 1, 0] } },
                negotiationLeads: { $sum: { $cond: [{ $eq: ['$status', 'negotiation'] }, 1, 0] } },
                wonLeads: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
                lostLeads: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
                totalValue: { $sum: '$estimatedValue' },
                averageValue: { $avg: '$estimatedValue' },
                conversionRate: {
                    $cond: [
                        { $gt: ['$totalLeads', 0] },
                        { $divide: ['$wonLeads', '$totalLeads'] },
                        0
                    ]
                }
            }
        }
    ]);
};

leadSchema.statics.getLeadsBySource = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: '$source',
                count: { $sum: 1 },
                totalValue: { $sum: '$estimatedValue' },
                wonCount: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

leadSchema.statics.getLeadsByPriority = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: '$priority',
                count: { $sum: 1 },
                totalValue: { $sum: '$estimatedValue' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Instance methods
leadSchema.methods.addActivity = function(activityData) {
    this.activities.push(activityData);
    return this.save();
};

leadSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    return this.save();
};

leadSchema.methods.updateLeadScore = function(score) {
    this.leadScore = Math.max(0, Math.min(100, score));
    return this.save();
};

leadSchema.methods.addTag = function(tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
    return this.save();
};

leadSchema.methods.removeTag = function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
};

module.exports = mongoose.model('Lead', leadSchema); 