const mongoose = require('mongoose');

const activeTimeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      required: true,
    },
    activityCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    sessionDuration: {
      type: Number, // in minutes
      default: 0,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    actions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
activeTimeSchema.index({ userId: 1, timeSlot: 1, dayOfWeek: 1, date: 1 });

module.exports = mongoose.model('ActiveTime', activeTimeSchema); 