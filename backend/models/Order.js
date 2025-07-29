const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative']
        },
        variant: {
            name: String,
            value: String
        },
        options: [{
            name: String,
            value: String,
            price: Number
        }]
    }],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    payment: {
        method: {
            type: String,
            enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD'
        },
        gateway: String,
        gatewayResponse: mongoose.Schema.Types.Mixed
    },
    totals: {
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative']
        },
        tax: {
            type: Number,
            default: 0,
            min: [0, 'Tax cannot be negative']
        },
        shipping: {
            type: Number,
            default: 0,
            min: [0, 'Shipping cannot be negative']
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative']
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative']
        }
    },
    shipping: {
        address: {
            firstName: {
                type: String,
                required: true,
                trim: true
            },
            lastName: {
                type: String,
                required: true,
                trim: true
            },
            company: String,
            address1: {
                type: String,
                required: true,
                trim: true
            },
            address2: String,
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true
            },
            zipCode: {
                type: String,
                required: true,
                trim: true
            },
            country: {
                type: String,
                required: true,
                trim: true
            },
            phone: {
                type: String,
                required: true,
                trim: true
            }
        },
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight', 'free'],
            default: 'standard'
        },
        trackingNumber: String,
        trackingUrl: String,
        carrier: String,
        estimatedDelivery: Date,
        shippedAt: Date,
        deliveredAt: Date
    },
    billing: {
        address: {
            firstName: {
                type: String,
                required: true,
                trim: true
            },
            lastName: {
                type: String,
                required: true,
                trim: true
            },
            company: String,
            address1: {
                type: String,
                required: true,
                trim: true
            },
            address2: String,
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true
            },
            zipCode: {
                type: String,
                required: true,
                trim: true
            },
            country: {
                type: String,
                required: true,
                trim: true
            },
            phone: {
                type: String,
                required: true,
                trim: true
            }
        },
        sameAsShipping: {
            type: Boolean,
            default: true
        }
    },
    notes: {
        customer: {
            type: String,
            maxlength: [500, 'Customer note cannot exceed 500 characters']
        },
        internal: {
            type: String,
            maxlength: [1000, 'Internal note cannot exceed 1000 characters']
        }
    },
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'api', 'admin'],
            default: 'web'
        },
        userAgent: String,
        ipAddress: String,
        referrer: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String
    },
    timeline: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    refunds: [{
        amount: {
            type: Number,
            required: true,
            min: [0, 'Refund amount cannot be negative']
        },
        reason: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processed', 'failed'],
            default: 'pending'
        },
        processedAt: Date,
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    analytics: {
        conversionValue: {
            type: Number,
            default: 0
        },
        customerLifetimeValue: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for customer full name
orderSchema.virtual('customerFullName').get(function() {
    return `${this.shipping.address.firstName} ${this.shipping.address.lastName}`;
});

// Virtual for order status color
orderSchema.virtual('statusColor').get(function() {
    const colors = {
        pending: 'yellow',
        confirmed: 'blue',
        processing: 'purple',
        shipped: 'indigo',
        delivered: 'green',
        cancelled: 'red',
        refunded: 'gray'
    };
    return colors[this.status] || 'gray';
});

// Virtual for is paid
orderSchema.virtual('isPaid').get(function() {
    return this.payment.status === 'completed';
});

// Virtual for is shipped
orderSchema.virtual('isShipped').get(function() {
    return ['shipped', 'delivered'].includes(this.status);
});

// Virtual for is delivered
orderSchema.virtual('isDelivered').get(function() {
    return this.status === 'delivered';
});

// Virtual for is cancelled
orderSchema.virtual('isCancelled').get(function() {
    return ['cancelled', 'refunded'].includes(this.status);
});

// Indexes for better query performance
// Note: orderNumber index is handled by unique: true in schema definition
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shipping.address.country': 1 });
orderSchema.index({ 'metadata.source': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }
    next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        // Calculate subtotal
        this.totals.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
        
        // Calculate total
        this.totals.total = this.totals.subtotal + this.totals.tax + this.totals.shipping - this.totals.discount;
        
        // Ensure total is not negative
        if (this.totals.total < 0) {
            this.totals.total = 0;
        }
    }
    next();
});

// Pre-save middleware to update timeline
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.timeline.push({
            status: this.status,
            timestamp: new Date(),
            note: `Order status changed to ${this.status}`
        });
    }
    next();
});

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
    return this.find({ status }).populate('customer', 'name email');
};

// Static method to find orders by customer
orderSchema.statics.findByCustomer = function(customerId) {
    return this.find({ customer: customerId }).populate('items.product', 'name images');
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totals.total' },
                averageOrderValue: { $avg: '$totals.total' }
            }
        }
    ]);
    return stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
    this.status = newStatus;
    this.timeline.push({
        status: newStatus,
        timestamp: new Date(),
        note,
        updatedBy
    });
    return this.save();
};

// Instance method to add refund
orderSchema.methods.addRefund = function(amount, reason, processedBy = null) {
    this.refunds.push({
        amount,
        reason,
        status: 'pending',
        processedBy
    });
    return this.save();
};

module.exports = mongoose.model('Order', orderSchema); 