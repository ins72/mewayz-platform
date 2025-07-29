const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'like', 'purchase', 'reply'],
      default: 'info',
    },
    read: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Product', 'User', 'Transaction'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 