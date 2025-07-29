const express = require('express');
const router = express.Router();
const systemStatusController = require('../../controllers/appControllers/systemStatusController');
const maintenanceController = require('../../controllers/appControllers/maintenanceController');
const { authenticateToken, requireAdmin } = require('../../middlewares/authMiddleware');

// System Status Routes
router.get('/status', systemStatusController.getAllStatuses);
router.get('/status/overall', systemStatusController.getOverallStatus);
router.get('/status/:service', systemStatusController.getServiceStatus);

// Admin-only system status routes
router.put('/status', authenticateToken, requireAdmin, systemStatusController.updateStatus);
router.post('/status/:service/incidents', authenticateToken, requireAdmin, systemStatusController.addIncident);
router.put('/status/:service/incidents/:incidentId/resolve', authenticateToken, requireAdmin, systemStatusController.resolveIncident);

// Maintenance Routes (public)
router.get('/maintenance', maintenanceController.getAllMaintenance);
router.get('/maintenance/current', maintenanceController.getCurrentMaintenance);
router.get('/maintenance/upcoming', maintenanceController.getUpcomingMaintenance);

// Admin-only maintenance routes
router.post('/maintenance', authenticateToken, requireAdmin, maintenanceController.createMaintenance);
router.put('/maintenance/:id', authenticateToken, requireAdmin, maintenanceController.updateMaintenance);
router.post('/maintenance/:id/updates', authenticateToken, requireAdmin, maintenanceController.addUpdate);
router.delete('/maintenance/:id', authenticateToken, requireAdmin, maintenanceController.deleteMaintenance);

module.exports = router; 