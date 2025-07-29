const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: [
            'order_created',
            'order_updated',
            'order_cancelled',
            'payment_received',
            'payment_failed',
            'customer_created',
            'customer_updated',
            'lead_assigned',
            'lead_updated',
            'product_low_stock',
            'system_alert',
            'user_invited',
            'password_reset',
            'email_verification',
            'general'
        ]
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
    actionUrl: {
        type: String,
        trim: true
    },
    actionText: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        default: 'bell'
    },
    category: {
        type: String,
        enum: ['system', 'business', 'personal', 'marketing'],
        default: 'business'
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
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isArchived: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get unread notifications for user
notificationSchema.statics.getUnreadForUser = function(userId, limit = 20) {
    return this.find({
        recipient: userId,
        isRead: false,
        isArchived: false,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email avatar');
};

// Static method to get all notifications for user
notificationSchema.statics.getForUser = function(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.find({
        recipient: userId,
        isArchived: false,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email avatar');
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds) {
    return this.updateMany(
        {
            _id: { $in: notificationIds },
            recipient: userId
        },
        {
            isRead: true,
            readAt: new Date()
        }
    );
};

// Static method to mark all notifications as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
    return this.updateMany(
        {
            recipient: userId,
            isRead: false
        },
        {
            isRead: true,
            readAt: new Date()
        }
    );
};

// Static method to archive notifications
notificationSchema.statics.archiveNotifications = function(userId, notificationIds) {
    return this.updateMany(
        {
            _id: { $in: notificationIds },
            recipient: userId
        },
        {
            isArchived: true
        }
    );
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Instance method to archive
notificationSchema.methods.archive = function() {
    this.isArchived = true;
    return this.save();
};

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return this.createdAt.toLocaleDateString();
});

module.exports = mongoose.model('Notification', notificationSchema); 