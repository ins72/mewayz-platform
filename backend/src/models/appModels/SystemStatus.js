const mongoose = require('mongoose');

const systemStatusSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      enum: ['core_platform', 'database', 'api_services', 'email_services', 'file_storage', 'payment_processing', 'analytics', 'cdn', 'monitoring', 'backup_system'],
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['operational', 'degraded', 'outage', 'maintenance'],
      default: 'operational'
    },
    uptime: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100
    },
    responseTime: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lastCheck: {
      type: Date,
      required: true,
      default: Date.now
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    incidents: [{
      type: {
        type: String,
        enum: ['outage', 'degraded', 'maintenance', 'resolved']
      },
      title: String,
      description: String,
      startTime: Date,
      endTime: Date,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }],
    metrics: {
      cpu: Number,
      memory: Number,
      disk: Number,
      network: Number
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
systemStatusSchema.index({ service: 1, status: 1 });
systemStatusSchema.index({ lastCheck: -1 });
systemStatusSchema.index({ isActive: 1 });

module.exports = mongoose.model('SystemStatus', systemStatusSchema); 