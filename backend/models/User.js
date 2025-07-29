const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
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
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator', 'enterprise'],
        default: 'user'
    },
    plan: {
        type: String,
        enum: ['Free', 'Pro', 'Enterprise'],
        default: 'Free'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending', 'inactive'],
        default: 'pending'
    },
    profile: {
        avatar: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        company: {
            type: String,
            maxlength: [100, 'Company name cannot exceed 100 characters']
        },
        website: {
            type: String,
            match: [/^https?:\/\/.+/, 'Please enter a valid URL']
        },
        location: {
            type: String,
            maxlength: [100, 'Location cannot exceed 100 characters']
        }
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            marketing: {
                type: Boolean,
                default: false
            }
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    billing: {
        stripeCustomerId: {
            type: String,
            default: null
        },
        subscriptionId: {
            type: String,
            default: null
        },
        planStartDate: {
            type: Date,
            default: null
        },
        planEndDate: {
            type: Date,
            default: null
        },
        paymentMethod: {
            type: String,
            default: null
        },
        billingAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },
    analytics: {
        lastLogin: {
            type: Date,
            default: null
        },
        loginCount: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        productsCreated: {
            type: Number,
            default: 0
        },
        coursesCreated: {
            type: Number,
            default: 0
        }
    },
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            default: null
        },
        backupCodes: [{
            code: String,
            used: {
                type: Boolean,
                default: false
            }
        }],
        loginHistory: [{
            ip: String,
            userAgent: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            success: {
                type: Boolean,
                default: true
            }
        }],
        passwordChangedAt: {
            type: Date,
            default: null
        }
    },
    verification: {
        emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String,
            default: null
        },
        emailVerificationExpires: {
            type: Date,
            default: null
        },
        phoneVerified: {
            type: Boolean,
            default: false
        },
        phoneNumber: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return this.name;
});

// Virtual for isActive
userSchema.virtual('isActive').get(function() {
    return this.status === 'active';
});

// Virtual for isPremium
userSchema.virtual('isPremium').get(function() {
    return this.plan === 'Pro' || this.plan === 'Enterprise';
});

// Index for better query performance  
// Note: email index is handled by unique: true in schema definition
userSchema.index({ role: 1 });
userSchema.index({ plan: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.passwordChangedAt = Date.now() - 1000; // 1 second ago
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.verification.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.verification.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return verificationToken;
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
    return this.find({ status: 'active' });
};

// Static method to find premium users
userSchema.statics.findPremiumUsers = function() {
    return this.find({ plan: { $in: ['Pro', 'Enterprise'] } });
};

module.exports = mongoose.model('User', userSchema); 