const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true,
        maxlength: [100, 'Plan name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Plan description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        monthly: {
            type: Number,
            required: [true, 'Monthly price is required'],
            min: [0, 'Price cannot be negative']
        },
        yearly: {
            type: Number,
            required: [true, 'Yearly price is required'],
            min: [0, 'Price cannot be negative']
        }
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    billingCycle: {
        type: String,
        default: 'monthly',
        enum: ['monthly', 'yearly', 'lifetime']
    },
    features: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        included: {
            type: Boolean,
            default: true
        },
        limit: {
            type: Number,
            default: null
        },
        unit: {
            type: String,
            default: null
        }
    }],
    limits: {
        users: {
            type: Number,
            default: 1
        },
        products: {
            type: Number,
            default: 10
        },
        customers: {
            type: Number,
            default: 100
        },
        orders: {
            type: Number,
            default: 1000
        },
        storage: {
            type: Number,
            default: 1 // GB
        },
        apiCalls: {
            type: Number,
            default: 1000
        }
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    trialDays: {
        type: Number,
        default: 0
    },
    setupFee: {
        type: Number,
        default: 0
    },
    stripePriceId: {
        type: String,
        trim: true
    },
    stripeProductId: {
        type: String,
        trim: true
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
pricingSchema.index({ isActive: 1, sortOrder: 1 });
pricingSchema.index({ isPopular: 1 });
pricingSchema.index({ 'price.monthly': 1 });
pricingSchema.index({ 'price.yearly': 1 });

// Virtual for yearly savings
pricingSchema.virtual('yearlySavings').get(function() {
    const monthlyTotal = this.price.monthly * 12;
    const yearlyPrice = this.price.yearly;
    return Math.max(0, monthlyTotal - yearlyPrice);
});

// Virtual for savings percentage
pricingSchema.virtual('savingsPercentage').get(function() {
    const monthlyTotal = this.price.monthly * 12;
    const yearlyPrice = this.price.yearly;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
});

// Pre-save middleware
pricingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get active plans
pricingSchema.statics.getActivePlans = function() {
    return this.find({ isActive: true })
        .sort({ sortOrder: 1, 'price.monthly': 1 })
        .populate('createdBy', 'name email');
};

// Static method to get popular plans
pricingSchema.statics.getPopularPlans = function() {
    return this.find({ isActive: true, isPopular: true })
        .sort({ sortOrder: 1 })
        .populate('createdBy', 'name email');
};

// Instance method to check if feature is included
pricingSchema.methods.hasFeature = function(featureName) {
    const feature = this.features.find(f => f.name === featureName);
    return feature ? feature.included : false;
};

// Instance method to get feature limit
pricingSchema.methods.getFeatureLimit = function(featureName) {
    const feature = this.features.find(f => f.name === featureName);
    return feature ? feature.limit : null;
};

module.exports = mongoose.model('Pricing', pricingSchema); 