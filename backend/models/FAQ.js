const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
        trim: true,
        maxlength: [500, 'Question cannot exceed 500 characters']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required'],
        trim: true,
        maxlength: [2000, 'Answer cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['general', 'technical', 'billing', 'support', 'features', 'security'],
        default: 'general'
    },
    tags: [{
        type: String,
        trim: true
    }],
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    notHelpfulCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
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

// Indexes
faqSchema.index({ category: 1, isPublished: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ priority: -1 });
faqSchema.index({ viewCount: -1 });

// Virtual for helpful ratio
faqSchema.virtual('helpfulRatio').get(function() {
    const total = this.helpfulCount + this.notHelpfulCount;
    return total > 0 ? (this.helpfulCount / total * 100).toFixed(1) : 0;
});

// Pre-save middleware
faqSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get FAQs by category
faqSchema.statics.getByCategory = function(category) {
    return this.find({ category, isPublished: true })
        .sort({ priority: -1, viewCount: -1 })
        .populate('createdBy', 'name email');
};

// Static method to search FAQs
faqSchema.statics.search = function(query) {
    return this.find({
        $and: [
            { isPublished: true },
            {
                $or: [
                    { question: { $regex: query, $options: 'i' } },
                    { answer: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            }
        ]
    })
    .sort({ priority: -1, viewCount: -1 })
    .populate('createdBy', 'name email');
};

// Instance method to increment view count
faqSchema.methods.incrementViewCount = function() {
    this.viewCount += 1;
    return this.save();
};

// Instance method to mark as helpful
faqSchema.methods.markHelpful = function() {
    this.helpfulCount += 1;
    return this.save();
};

// Instance method to mark as not helpful
faqSchema.methods.markNotHelpful = function() {
    this.notHelpfulCount += 1;
    return this.save();
};

module.exports = mongoose.model('FAQ', faqSchema); 