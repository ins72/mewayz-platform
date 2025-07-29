const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/appControllers/contentController');
const { authenticateToken, requireAdmin } = require('../../middlewares/authMiddleware');

// Public content routes
router.get('/files', contentController.getAllFiles);
router.get('/overview', contentController.getContentOverview);
router.get('/files/:id', contentController.getFileById);
router.post('/files/:id/download', contentController.incrementDownload);
router.post('/files/:id/view', contentController.incrementView);

// Admin-only content routes
router.post('/files', authenticateToken, requireAdmin, contentController.createFile);
router.put('/files/:id', authenticateToken, requireAdmin, contentController.updateFile);
router.delete('/files/:id', authenticateToken, requireAdmin, contentController.deleteFile);

module.exports = router; 