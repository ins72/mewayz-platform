const SystemStatus = require('../../models/appModels/SystemStatus');

const systemStatusController = {
  // Get all system statuses
  getAllStatuses: async (req, res) => {
    try {
      const statuses = await SystemStatus.find({ isActive: true })
        .sort({ service: 1 })
        .lean();

      res.json({
        success: true,
        data: statuses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system statuses',
        error: error.message
      });
    }
  },

  // Get overall system status
  getOverallStatus: async (req, res) => {
    try {
      const statuses = await SystemStatus.find({ isActive: true }).lean();
      
      const operational = statuses.filter(s => s.status === 'operational').length;
      const total = statuses.length;
      const overallStatus = total > 0 ? (operational / total) * 100 : 100;
      
      const overall = overallStatus >= 99 ? 'operational' : 
                     overallStatus >= 95 ? 'degraded' : 'outage';

      const responseTime = statuses.reduce((acc, s) => acc + s.responseTime, 0) / total || 0;
      const uptime = statuses.reduce((acc, s) => acc + s.uptime, 0) / total || 100;

      res.json({
        success: true,
        data: {
          overall,
          uptime: `${uptime.toFixed(2)}%`,
          responseTime: `${responseTime.toFixed(0)}ms`,
          lastIncident: '2024-01-10', // This should come from incidents collection
          services: statuses
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overall system status',
        error: error.message
      });
    }
  },

  // Update system status
  updateStatus: async (req, res) => {
    try {
      const { service, status, uptime, responseTime, description } = req.body;

      const updatedStatus = await SystemStatus.findOneAndUpdate(
        { service },
        {
          status,
          uptime,
          responseTime,
          description,
          lastCheck: new Date()
        },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        data: updatedStatus
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update system status',
        error: error.message
      });
    }
  },

  // Get service status by name
  getServiceStatus: async (req, res) => {
    try {
      const { service } = req.params;
      
      const status = await SystemStatus.findOne({ 
        service, 
        isActive: true 
      }).lean();

      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Service status not found'
        });
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service status',
        error: error.message
      });
    }
  },

  // Add incident to service
  addIncident: async (req, res) => {
    try {
      const { service } = req.params;
      const { type, title, description, severity } = req.body;

      const status = await SystemStatus.findOne({ service });
      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      status.incidents.push({
        type,
        title,
        description,
        severity,
        startTime: new Date()
      });

      await status.save();

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add incident',
        error: error.message
      });
    }
  },

  // Resolve incident
  resolveIncident: async (req, res) => {
    try {
      const { service, incidentId } = req.params;

      const status = await SystemStatus.findOne({ service });
      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      const incident = status.incidents.id(incidentId);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }

      incident.endTime = new Date();
      await status.save();

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to resolve incident',
        error: error.message
      });
    }
  }
};

module.exports = systemStatusController; 