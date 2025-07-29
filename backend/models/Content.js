const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'Content key is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Content key cannot exceed 100 characters']
    },
    type: {
        type: String,
        enum: ['page', 'section', 'component'],
        required: [true, 'Content type is required']
    },
    content: {
        title: {
            type: String,
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishedAt: {
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
    version: {
        type: Number,
        default: 1
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        seoTitle: String,
        seoDescription: String,
        keywords: [String],
        ogImage: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
contentSchema.index({ key: 1, isActive: 1 });
contentSchema.index({ type: 1, isActive: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ publishedAt: -1 });

// Pre-save middleware
contentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.isModified('content')) {
        this.version += 1;
    }
    next();
});

// Static method to get content by key
contentSchema.statics.getByKey = function(key) {
    return this.findOne({ key, isActive: true })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
};

// Static method to get content by type
contentSchema.statics.getByType = function(type) {
    return this.find({ type, isActive: true })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ publishedAt: -1 });
};

// Static method to search content
contentSchema.statics.search = function(query) {
    return this.find({
        $and: [
            { isActive: true },
            {
                $or: [
                    { key: { $regex: query, $options: 'i' } },
                    { 'content.title': { $regex: query, $options: 'i' } },
                    { 'content.description': { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            }
        ]
    })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ publishedAt: -1 });
};

// Instance method to publish content
contentSchema.methods.publish = function() {
    this.isActive = true;
    this.publishedAt = Date.now();
    return this.save();
};

// Instance method to unpublish content
contentSchema.methods.unpublish = function() {
    this.isActive = false;
    return this.save();
};

// Virtual for content summary
contentSchema.virtual('summary').get(function() {
    if (this.content.description) {
        return this.content.description.length > 150 
            ? this.content.description.substring(0, 150) + '...'
            : this.content.description;
    }
    return '';
});

module.exports = mongoose.model('Content', contentSchema); 