const mongoose = require('mongoose');

const performanceMetricsSchema = new mongoose.Schema(
  {
    metric: {
      type: String,
      required: true,
      enum: ['page_load_time', 'server_response', 'database_query', 'api_response', 'memory_usage', 'cpu_usage', 'disk_usage', 'network_latency'],
      index: true
    },
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['ms', 's', 'mb', 'gb', 'percent', 'requests_per_second']
    },
    target: {
      type: Number,
      required: true
    },
    threshold: {
      warning: Number,
      critical: Number
    },
    change: {
      type: Number, // percentage change from previous period
      default: 0
    },
    changeType: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    context: {
      page: String,
      endpoint: String,
      service: String,
      userAgent: String,
      ip: String
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    period: {
      type: String,
      required: true,
      enum: ['realtime', 'hourly', 'daily', 'weekly', 'monthly'],
      default: 'realtime'
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
performanceMetricsSchema.index({ metric: 1, timestamp: -1 });
performanceMetricsSchema.index({ period: 1, timestamp: -1 });
performanceMetricsSchema.index({ isActive: 1 });

module.exports = mongoose.model('PerformanceMetrics', performanceMetricsSchema); 