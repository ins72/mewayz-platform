const mongoose = require('mongoose');

const contentFileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      required: true,
      enum: ['image', 'video', 'audio', 'document', 'archive', 'code', 'spreadsheet', 'presentation', 'other'],
      index: true
    },
    extension: {
      type: String,
      required: true
    },
    folder: {
      type: String,
      default: '/',
      index: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    metadata: {
      width: Number,
      height: Number,
      duration: Number,
      pages: Number,
      encoding: String,
      bitrate: Number,
      resolution: String
    },
    permissions: {
      public: {
        type: Boolean,
        default: false
      },
      roles: [{
        type: String,
        enum: ['user', 'admin', 'creator', 'affiliate']
      }],
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
contentFileSchema.index({ type: 1, folder: 1 });
contentFileSchema.index({ uploader: 1, createdAt: -1 });
contentFileSchema.index({ isActive: 1, isDeleted: 1 });
contentFileSchema.index({ tags: 1 });
contentFileSchema.index({ size: -1 });
contentFileSchema.index({ downloads: -1 });

module.exports = mongoose.model('ContentFile', contentFileSchema); 