const ContentFile = require('../../models/appModels/ContentFile');

const contentController = {
  // Get all content files
  getAllFiles: async (req, res) => {
    try {
      const { page = 1, limit = 20, type, folder, search } = req.query;
      
      const query = { isActive: true, isDeleted: false };
      if (type) query.type = type;
      if (folder) query.folder = folder;
      if (search) {
        query.$or = [
          { filename: { $regex: search, $options: 'i' } },
          { originalName: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const files = await ContentFile.find(query)
        .populate('uploader', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await ContentFile.countDocuments(query);

      res.json({
        success: true,
        data: files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content files',
        error: error.message
      });
    }
  },

  // Get content overview statistics
  getContentOverview: async (req, res) => {
    try {
      const [
        totalFiles,
        totalSize,
        filesByType,
        recentUploads
      ] = await Promise.all([
        ContentFile.countDocuments({ isActive: true, isDeleted: false }),
        ContentFile.aggregate([
          { $match: { isActive: true, isDeleted: false } },
          { $group: { _id: null, totalSize: { $sum: '$size' } } }
        ]),
        ContentFile.aggregate([
          { $match: { isActive: true, isDeleted: false } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        ContentFile.find({ isActive: true, isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('uploader', 'name email')
          .lean()
      ]);

      const totalSizeInBytes = totalSize[0]?.totalSize || 0;
      const totalSizeInGB = (totalSizeInBytes / (1024 * 1024 * 1024)).toFixed(2);

      const fileTypes = filesByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          files: {
            total: totalFiles,
            byType: fileTypes
          },
          storage: {
            total: totalSizeInGB,
            unit: 'GB'
          },
          users: {
            active: await ContentFile.distinct('uploader', { isActive: true, isDeleted: false }).then(ids => ids.length)
          },
          uploads: {
            recent: recentUploads
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content overview',
        error: error.message
      });
    }
  },

  // Get file by ID
  getFileById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const file = await ContentFile.findOne({ 
        _id: id, 
        isActive: true, 
        isDeleted: false 
      })
        .populate('uploader', 'name email')
        .lean();

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch file',
        error: error.message
      });
    }
  },

  // Create new file record
  createFile: async (req, res) => {
    try {
      const fileData = req.body;
      fileData.uploader = req.user.id; // From auth middleware
      
      const file = new ContentFile(fileData);
      await file.save();

      res.status(201).json({
        success: true,
        data: file
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create file record',
        error: error.message
      });
    }
  },

  // Update file
  updateFile: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const file = await ContentFile.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update file',
        error: error.message
      });
    }
  },

  // Delete file (soft delete)
  deleteFile: async (req, res) => {
    try {
      const { id } = req.params;

      const file = await ContentFile.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error.message
      });
    }
  },

  // Increment download count
  incrementDownload: async (req, res) => {
    try {
      const { id } = req.params;

      const file = await ContentFile.findByIdAndUpdate(
        id,
        { $inc: { downloads: 1 } },
        { new: true }
      );

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update download count',
        error: error.message
      });
    }
  },

  // Increment view count
  incrementView: async (req, res) => {
    try {
      const { id } = req.params;

      const file = await ContentFile.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update view count',
        error: error.message
      });
    }
  }
};

module.exports = contentController; 