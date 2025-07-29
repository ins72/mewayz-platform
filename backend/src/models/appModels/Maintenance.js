const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['scheduled', 'emergency', 'upgrade', 'security', 'performance'],
      default: 'scheduled'
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: true
    },
    affectedServices: [{
      type: String,
      enum: ['core_platform', 'database', 'api_services', 'email_services', 'file_storage', 'payment_processing', 'analytics', 'cdn', 'monitoring', 'backup_system', 'all']
    }],
    impact: {
      type: String,
      required: true,
      enum: ['none', 'minimal', 'moderate', 'significant', 'complete'],
      default: 'minimal'
    },
    updates: [{
      type: {
        type: String,
        enum: ['info', 'progress', 'completion', 'delay', 'cancellation']
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      webhook: {
        type: Boolean,
        default: false
      }
    },
    contactInfo: {
      name: String,
      email: String,
      phone: String
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
maintenanceSchema.index({ startTime: 1, endTime: 1 });
maintenanceSchema.index({ status: 1, type: 1 });
maintenanceSchema.index({ isActive: 1, isPublic: 1 });
maintenanceSchema.index({ affectedServices: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema); 