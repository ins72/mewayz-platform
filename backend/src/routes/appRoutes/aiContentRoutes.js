const express = require('express');
const {
  getContentProjects,
  getContentProject,
  createContentProject,
  updateContentProject,
  deleteContentProject,
  generateContent,
  getContentAnalytics,
  optimizeContent,
  runABTest,
  getContentTemplates,
  updateModelConfig,
  getCostTracking,
  exportAnalyticsReport
} = require('../../controllers/appControllers/aiContentController');

const { protect, authorize } = require('../../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Content Projects Routes
router.route('/projects')
  .get(getContentProjects)
  .post(authorize('admin', 'manager', 'content_creator'), createContentProject);

router.route('/projects/:id')
  .get(getContentProject)
  .put(authorize('admin', 'manager', 'content_creator'), updateContentProject)
  .delete(authorize('admin', 'manager'), deleteContentProject);

// Content Generation Routes
router.post('/projects/:id/generate', authorize('admin', 'manager', 'content_creator'), generateContent);

// Analytics Routes
router.get('/projects/:id/analytics', getContentAnalytics);
router.get('/projects/:id/export', exportAnalyticsReport);

// Content Optimization Routes
router.post('/projects/:id/optimize/:contentId', authorize('admin', 'manager', 'content_creator'), optimizeContent);
router.post('/projects/:id/ab-test', authorize('admin', 'manager'), runABTest);

// Templates Routes
router.get('/templates', getContentTemplates);

// Configuration Routes
router.put('/model-config/:id', authorize('admin', 'manager'), updateModelConfig);

// Cost Tracking Routes
router.get('/projects/:id/costs', authorize('admin', 'manager'), getCostTracking);

module.exports = router; 