const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [255, 'Title cannot be more than 255 characters']
    },
    slug: {
        type: String,
        required: [true, 'Please add a slug'],
        unique: true,
        lowercase: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'Please add an excerpt'],
        maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'E-commerce',
            'CRM',
            'Product Management',
            'Analytics',
            'Marketing',
            'Technology',
            'Business',
            'Tutorial',
            'News',
            'Case Study'
        ]
    },
    tags: [{
        type: String,
        trim: true
    }],
    featuredImage: {
        url: {
            type: String,
            required: [true, 'Please add a featured image URL']
        },
        alt: {
            type: String,
            required: [true, 'Please add alt text for the image']
        },
        caption: String
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date,
        default: null
    },
    metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    featured: {
        type: Boolean,
        default: false
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    readTime: {
        type: Number,
        min: [1, 'Read time must be at least 1 minute'],
        default: 5
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    shareCount: {
        type: Number,
        default: 0
    },
    seoScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    comments: [{
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: [true, 'Please add comment content'],
            maxlength: [1000, 'Comment cannot be more than 1000 characters']
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'spam'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }],
        replies: [{
            author: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: [true, 'Please add reply content'],
                maxlength: [500, 'Reply cannot be more than 500 characters']
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    relatedPosts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'BlogPost'
    }],
    socialShares: {
        facebook: { type: Number, default: 0 },
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 },
        pinterest: { type: Number, default: 0 }
    },
    analytics: {
        uniqueVisitors: { type: Number, default: 0 },
        bounceRate: { type: Number, default: 0 },
        avgTimeOnPage: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 }
    },
    settings: {
        allowSocialSharing: { type: Boolean, default: true },
        showAuthorBio: { type: Boolean, default: true },
        showRelatedPosts: { type: Boolean, default: true },
        showTableOfContents: { type: Boolean, default: false },
        enableNewsletterSignup: { type: Boolean, default: false }
    },
    publishedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from title before saving
BlogPostSchema.pre('save', function(next) {
    if (!this.isModified('title')) {
        return next();
    }
    
    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    
    next();
});

// Auto-generate meta description from excerpt if not provided
BlogPostSchema.pre('save', function(next) {
    if (!this.metaDescription && this.excerpt) {
        this.metaDescription = this.excerpt.substring(0, 160);
    }
    next();
});

// Auto-generate meta title from title if not provided
BlogPostSchema.pre('save', function(next) {
    if (!this.metaTitle && this.title) {
        this.metaTitle = this.title.substring(0, 60);
    }
    next();
});

// Calculate read time based on content length
BlogPostSchema.pre('save', function(next) {
    if (this.isModified('content')) {
        const wordsPerMinute = 200;
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }
    next();
});

// Virtual for comment count
BlogPostSchema.virtual('commentCount').get(function() {
    return this.comments.filter(comment => comment.status === 'approved').length;
});

// Virtual for full URL
BlogPostSchema.virtual('fullUrl').get(function() {
    return `${process.env.FRONTEND_URL}/blog/${this.slug}`;
});

// Index for better performance
// Note: slug index is handled by unique: true in schema definition
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1, status: 1 });
BlogPostSchema.index({ author: 1, status: 1 });
BlogPostSchema.index({ tags: 1, status: 1 });
BlogPostSchema.index({ featured: 1, status: 1, publishedAt: -1 });

// Static method to get featured posts
BlogPostSchema.statics.getFeaturedPosts = function(limit = 5) {
    return this.find({
        status: 'published',
        featured: true
    })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get posts by category
BlogPostSchema.statics.getPostsByCategory = function(category, limit = 10) {
    return this.find({
        status: 'published',
        category: category
    })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to search posts
BlogPostSchema.statics.searchPosts = function(query, limit = 10) {
    return this.find({
        status: 'published',
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Instance method to increment view count
BlogPostSchema.methods.incrementViewCount = function() {
    this.viewCount += 1;
    return this.save();
};

// Instance method to add comment
BlogPostSchema.methods.addComment = function(authorId, content) {
    this.comments.push({
        author: authorId,
        content: content
    });
    return this.save();
};

// Instance method to approve comment
BlogPostSchema.methods.approveComment = function(commentId) {
    const comment = this.comments.id(commentId);
    if (comment) {
        comment.status = 'approved';
        return this.save();
    }
    throw new Error('Comment not found');
};

module.exports = mongoose.model('BlogPost', BlogPostSchema); 