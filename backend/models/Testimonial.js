const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer ID is required']
    },
    content: {
        type: String,
        required: [true, 'Testimonial content is required'],
        trim: true,
        maxlength: [1000, 'Testimonial content cannot exceed 1000 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
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
    },
    category: {
        type: String,
        enum: ['general', 'product', 'service', 'support', 'implementation'],
        default: 'general'
    },
    tags: [{
        type: String,
        trim: true
    }],
    helpful: {
        count: {
            type: Number,
            default: 0
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    notHelpful: {
        count: {
            type: Number,
            default: 0
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    metadata: {
        companySize: {
            type: String,
            enum: ['startup', 'small', 'medium', 'large', 'enterprise']
        },
        industry: {
            type: String,
            trim: true
        },
        useCase: {
            type: String,
            trim: true
        },
        implementationTime: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
testimonialSchema.index({ isVerified: 1, isPublic: 1, publishedAt: -1 });
testimonialSchema.index({ customerId: 1 });
testimonialSchema.index({ category: 1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ tags: 1 });

// Pre-save middleware
testimonialSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get public testimonials
testimonialSchema.statics.getPublic = function(limit = 10, category = null) {
    const query = { isVerified: true, isPublic: true };
    if (category) {
        query.category = category;
    }
    
    return this.find(query)
        .populate('customerId', 'name company role location')
        .populate('createdBy', 'name email')
        .sort({ publishedAt: -1 })
        .limit(limit);
};

// Static method to get testimonials by rating
testimonialSchema.statics.getByRating = function(rating, limit = 10) {
    return this.find({ 
        isVerified: true, 
        isPublic: true, 
        rating: { $gte: rating } 
    })
    .populate('customerId', 'name company role location')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get testimonials by category
testimonialSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ 
        isVerified: true, 
        isPublic: true, 
        category 
    })
    .populate('customerId', 'name company role location')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to search testimonials
testimonialSchema.statics.search = function(query, limit = 10) {
    return this.find({
        $and: [
            { isVerified: true, isPublic: true },
            {
                $or: [
                    { content: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } },
                    { 'metadata.industry': { $regex: query, $options: 'i' } },
                    { 'metadata.useCase': { $regex: query, $options: 'i' } }
                ]
            }
        ]
    })
    .populate('customerId', 'name company role location')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Instance method to mark as helpful
testimonialSchema.methods.markHelpful = function(userId) {
    if (!this.helpful.users.includes(userId)) {
        this.helpful.users.push(userId);
        this.helpful.count += 1;
        
        // Remove from not helpful if user had marked it as not helpful
        const notHelpfulIndex = this.notHelpful.users.indexOf(userId);
        if (notHelpfulIndex > -1) {
            this.notHelpful.users.splice(notHelpfulIndex, 1);
            this.notHelpful.count -= 1;
        }
    }
    return this.save();
};

// Instance method to mark as not helpful
testimonialSchema.methods.markNotHelpful = function(userId) {
    if (!this.notHelpful.users.includes(userId)) {
        this.notHelpful.users.push(userId);
        this.notHelpful.count += 1;
        
        // Remove from helpful if user had marked it as helpful
        const helpfulIndex = this.helpful.users.indexOf(userId);
        if (helpfulIndex > -1) {
            this.helpful.users.splice(helpfulIndex, 1);
            this.helpful.count -= 1;
        }
    }
    return this.save();
};

// Instance method to verify testimonial
testimonialSchema.methods.verify = function() {
    this.isVerified = true;
    return this.save();
};

// Instance method to publish testimonial
testimonialSchema.methods.publish = function() {
    this.isPublic = true;
    this.publishedAt = Date.now();
    return this.save();
};

// Virtual for helpful ratio
testimonialSchema.virtual('helpfulRatio').get(function() {
    const total = this.helpful.count + this.notHelpful.count;
    return total > 0 ? (this.helpful.count / total * 100).toFixed(1) : 0;
});

// Virtual for time ago
testimonialSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.publishedAt) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return this.publishedAt.toLocaleDateString();
});

module.exports = mongoose.model('Testimonial', testimonialSchema); 