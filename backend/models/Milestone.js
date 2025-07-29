const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Milestone title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Milestone description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    date: {
        type: Date,
        required: [true, 'Milestone date is required']
    },
    type: {
        type: String,
        enum: ['achievement', 'launch', 'partnership', 'funding', 'expansion', 'award'],
        required: [true, 'Milestone type is required']
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        type: String,
        enum: ['company', 'product', 'technology', 'business', 'community'],
        default: 'company'
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        location: {
            type: String,
            trim: true
        },
        participants: [{
            name: String,
            role: String,
            company: String
        }],
        metrics: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        links: [{
            title: String,
            url: String,
            type: String
        }],
        media: [{
            type: String,
            url: String,
            alt: String,
            caption: String
        }]
    },
    impact: {
        users: {
            type: Number,
            default: 0
        },
        revenue: {
            type: Number,
            default: 0
        },
        reach: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'cancelled'],
        default: 'completed'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
milestoneSchema.index({ isPublic: 1, date: -1 });
milestoneSchema.index({ type: 1, isPublic: 1 });
milestoneSchema.index({ category: 1, isPublic: 1 });
milestoneSchema.index({ isFeatured: 1, isPublic: 1 });
milestoneSchema.index({ tags: 1 });

// Pre-save middleware
milestoneSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get public milestones
milestoneSchema.statics.getPublic = function(limit = 20, type = null) {
    const query = { isPublic: true };
    if (type) {
        query.type = type;
    }
    
    return this.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ date: -1 })
        .limit(limit);
};

// Static method to get featured milestones
milestoneSchema.statics.getFeatured = function(limit = 5) {
    return this.find({ isPublic: true, isFeatured: true })
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .limit(limit);
};

// Static method to get milestones by type
milestoneSchema.statics.getByType = function(type, limit = 10) {
    return this.find({ isPublic: true, type })
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .limit(limit);
};

// Static method to get milestones by category
milestoneSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ isPublic: true, category })
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .limit(limit);
};

// Static method to get milestones by year
milestoneSchema.statics.getByYear = function(year, limit = 20) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return this.find({
        isPublic: true,
        date: { $gte: startDate, $lte: endDate }
    })
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .limit(limit);
};

// Static method to search milestones
milestoneSchema.statics.search = function(query, limit = 10) {
    return this.find({
        $and: [
            { isPublic: true },
            {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } },
                    { 'metadata.location': { $regex: query, $options: 'i' } }
                ]
            }
        ]
    })
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .limit(limit);
};

// Instance method to feature milestone
milestoneSchema.methods.feature = function() {
    this.isFeatured = true;
    return this.save();
};

// Instance method to unfeature milestone
milestoneSchema.methods.unfeature = function() {
    this.isFeatured = false;
    return this.save();
};

// Instance method to publish milestone
milestoneSchema.methods.publish = function() {
    this.isPublic = true;
    return this.save();
};

// Instance method to unpublish milestone
milestoneSchema.methods.unpublish = function() {
    this.isPublic = false;
    return this.save();
};

// Virtual for year
milestoneSchema.virtual('year').get(function() {
    return this.date.getFullYear();
});

// Virtual for month
milestoneSchema.virtual('month').get(function() {
    return this.date.toLocaleString('default', { month: 'long' });
});

// Virtual for formatted date
milestoneSchema.virtual('formattedDate').get(function() {
    return this.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for time ago
milestoneSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.date) / 1000);
    
    if (diffInSeconds < 0) return 'Upcoming';
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
});

module.exports = mongoose.model('Milestone', milestoneSchema); 