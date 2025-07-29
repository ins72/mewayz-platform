const Maintenance = require('../../models/appModels/Maintenance');

const maintenanceController = {
  // Get all maintenance schedules
  getAllMaintenance: async (req, res) => {
    try {
      const { status, type, limit = 10 } = req.query;
      
      const query = { isActive: true };
      if (status) query.status = status;
      if (type) query.type = type;

      const maintenance = await Maintenance.find(query)
        .sort({ startTime: -1 })
        .limit(parseInt(limit))
        .lean();

      res.json({
        success: true,
        data: maintenance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch maintenance schedules',
        error: error.message
      });
    }
  },

  // Get current maintenance
  getCurrentMaintenance: async (req, res) => {
    try {
      const now = new Date();
      
      const currentMaintenance = await Maintenance.find({
        isActive: true,
        isPublic: true,
        startTime: { $lte: now },
        endTime: { $gte: now }
      }).lean();

      res.json({
        success: true,
        data: currentMaintenance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current maintenance',
        error: error.message
      });
    }
  },

  // Get upcoming maintenance
  getUpcomingMaintenance: async (req, res) => {
    try {
      const now = new Date();
      const { limit = 5 } = req.query;
      
      const upcomingMaintenance = await Maintenance.find({
        isActive: true,
        isPublic: true,
        startTime: { $gt: now }
      })
        .sort({ startTime: 1 })
        .limit(parseInt(limit))
        .lean();

      res.json({
        success: true,
        data: upcomingMaintenance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming maintenance',
        error: error.message
      });
    }
  },

  // Create maintenance schedule
  createMaintenance: async (req, res) => {
    try {
      const maintenanceData = req.body;
      
      const maintenance = new Maintenance(maintenanceData);
      await maintenance.save();

      res.status(201).json({
        success: true,
        data: maintenance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create maintenance schedule',
        error: error.message
      });
    }
  },

  // Update maintenance
  updateMaintenance: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const maintenance = await Maintenance.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!maintenance) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance schedule not found'
        });
      }

      res.json({
        success: true,
        data: maintenance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update maintenance schedule',
        error: error.message
      });
    }
  },

  // Add update to maintenance
  addUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const { type, message } = req.body;

      const maintenance = await Maintenance.findById(id);
      if (!maintenance) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance schedule not found'
        });
      }

      maintenance.updates.push({
        type,
        message,
        timestamp: new Date()
      });

      await maintenance.save();

      res.json({
        success: true,
        data: maintenance
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add update',
        error: error.message
      });
    }
  },

  // Delete maintenance
  deleteMaintenance: async (req, res) => {
    try {
      const { id } = req.params;

      const maintenance = await Maintenance.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!maintenance) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance schedule not found'
        });
      }

      res.json({
        success: true,
        message: 'Maintenance schedule deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete maintenance schedule',
        error: error.message
      });
    }
  }
};

module.exports = maintenanceController; 