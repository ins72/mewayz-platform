const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    comparePrice: {
        type: Number,
        min: [0, 'Compare price cannot be negative']
    },
    cost: {
        type: Number,
        min: [0, 'Cost cannot be negative']
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    tags: [{
        type: String,
        trim: true
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    variants: [{
        name: {
            type: String,
            required: true
        },
        options: [{
            name: String,
            value: String,
            price: Number,
            sku: String,
            stock: Number
        }]
    }],
    inventory: {
        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative']
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
            min: [0, 'Low stock threshold cannot be negative']
        },
        trackInventory: {
            type: Boolean,
            default: true
        },
        allowBackorders: {
            type: Boolean,
            default: false
        }
    },
    shipping: {
        weight: {
            type: Number,
            min: [0, 'Weight cannot be negative']
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        requiresShipping: {
            type: Boolean,
            default: true
        },
        shippingClass: {
            type: String,
            enum: ['standard', 'express', 'overnight', 'free'],
            default: 'standard'
        }
    },
    seo: {
        metaTitle: {
            type: String,
            maxlength: [60, 'Meta title cannot exceed 60 characters']
        },
        metaDescription: {
            type: String,
            maxlength: [160, 'Meta description cannot exceed 160 characters']
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true
        },
        keywords: [String]
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'scheduled'],
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'password-protected'],
        default: 'public'
    },
    featured: {
        type: Boolean,
        default: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    analytics: {
        views: {
            type: Number,
            default: 0
        },
        sales: {
            type: Number,
            default: 0
        },
        revenue: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            default: 0
        }
    },
    settings: {
        allowReviews: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        },
        taxClass: {
            type: String,
            enum: ['standard', 'reduced', 'zero', 'exempt'],
            default: 'standard'
        },
        downloadable: {
            type: Boolean,
            default: false
        },
        virtual: {
            type: Boolean,
            default: false
        }
    },
    customFields: [{
        name: {
            type: String,
            required: true
        },
        value: mongoose.Schema.Types.Mixed,
        type: {
            type: String,
            enum: ['text', 'number', 'boolean', 'date', 'select'],
            default: 'text'
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.comparePrice && this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
    return 0;
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
    if (this.cost && this.price > this.cost) {
        return Math.round(((this.price - this.cost) / this.price) * 100);
    }
    return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.inventory.stock === 0) return 'out-of-stock';
    if (this.inventory.stock <= this.inventory.lowStockThreshold) return 'low-stock';
    return 'in-stock';
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ creator: 1 });
productSchema.index({ 'analytics.averageRating': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
// Note: sku index is handled by unique: true in schema definition

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
    if (!this.sku) {
        this.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Pre-save middleware to generate slug if not provided
productSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Static method to find featured products
productSchema.statics.findFeatured = function() {
    return this.find({ featured: true, status: 'published' });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId) {
    return this.find({ category: categoryId, status: 'published' });
};

// Static method to search products
productSchema.statics.search = function(query) {
    return this.find({
        $text: { $search: query },
        status: 'published'
    }).sort({ score: { $meta: 'textScore' } });
};

// Instance method to update analytics
productSchema.methods.updateAnalytics = function(type, value = 1) {
    switch (type) {
        case 'view':
            this.analytics.views += value;
            break;
        case 'sale':
            this.analytics.sales += value;
            this.analytics.revenue += value * this.price;
            break;
        case 'rating':
            this.analytics.averageRating = value;
            break;
        case 'review':
            this.analytics.reviewCount += value;
            break;
    }
    return this.save();
};

module.exports = mongoose.model('Product', productSchema); 