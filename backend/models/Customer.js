const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Customer name is required'], 
        trim: true, 
        maxlength: [100, 'Name cannot exceed 100 characters'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
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
    status: { 
        type: String, 
        enum: ['lead', 'prospect', 'customer', 'inactive', 'churned'], 
        default: 'lead' 
    },
    source: { 
        type: String, 
        enum: ['website', 'referral', 'social', 'email', 'event', 'other'], 
        default: 'website' 
    },
    tags: [{ 
        type: String, 
        trim: true 
    }],
    notes: { 
        type: String, 
        maxlength: [1000, 'Notes cannot exceed 1000 characters'] 
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
    preferences: {
        communicationMethod: { 
            type: String, 
            enum: ['email', 'phone', 'sms', 'preferred'], 
            default: 'email' 
        },
        timezone: { 
            type: String, 
            default: 'UTC' 
        },
        language: { 
            type: String, 
            default: 'en' 
        }
    },
    analytics: {
        totalOrders: { 
            type: Number, 
            default: 0 
        },
        totalSpent: { 
            type: Number, 
            default: 0 
        },
        averageOrderValue: { 
            type: Number, 
            default: 0 
        },
        lastPurchaseDate: { 
            type: Date, 
            default: null 
        },
        lifetimeValue: { 
            type: Number, 
            default: 0 
        }
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

// Virtuals
customerSchema.virtual('fullName').get(function() {
    return this.name;
});

customerSchema.virtual('isActive').get(function() {
    return ['lead', 'prospect', 'customer'].includes(this.status);
});

customerSchema.virtual('isCustomer').get(function() {
    return this.status === 'customer';
});

// Indexes
// Note: email index is handled by unique: true in schema definition
customerSchema.index({ status: 1 });
customerSchema.index({ company: 1 });
customerSchema.index({ createdBy: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ 'analytics.totalSpent': -1 });
customerSchema.index({ createdAt: -1 });

// Pre-save middleware
customerSchema.pre('save', function(next) {
    // Calculate average order value
    if (this.analytics.totalOrders > 0) {
        this.analytics.averageOrderValue = this.analytics.totalSpent / this.analytics.totalOrders;
    }
    next();
});

// Static methods
customerSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

customerSchema.statics.findBySource = function(source) {
    return this.find({ source });
};

customerSchema.statics.getCustomerStats = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                totalLeads: { $sum: { $cond: [{ $eq: ['$status', 'lead'] }, 1, 0] } },
                totalProspects: { $sum: { $cond: [{ $eq: ['$status', 'prospect'] }, 1, 0] } },
                totalActiveCustomers: { $sum: { $cond: [{ $eq: ['$status', 'customer'] }, 1, 0] } },
                totalInactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
                totalChurned: { $sum: { $cond: [{ $eq: ['$status', 'churned'] }, 1, 0] } },
                totalRevenue: { $sum: '$analytics.totalSpent' },
                averageLifetimeValue: { $avg: '$analytics.lifetimeValue' }
            }
        }
    ]);
};

customerSchema.statics.getCustomersBySource = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: '$source',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$analytics.totalSpent' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Instance methods
customerSchema.methods.updateAnalytics = function(orderData) {
    this.analytics.totalOrders += 1;
    this.analytics.totalSpent += orderData.total;
    this.analytics.lastPurchaseDate = new Date();
    this.analytics.lifetimeValue = this.analytics.totalSpent;
    return this.save();
};

customerSchema.methods.addTag = function(tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
    return this.save();
};

customerSchema.methods.removeTag = function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
};

module.exports = mongoose.model('Customer', customerSchema); 