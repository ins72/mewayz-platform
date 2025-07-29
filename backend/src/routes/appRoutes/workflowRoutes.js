const express = require('express');
const {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getExecutionHistory,
  getWorkflowStats,
  toggleWorkflow,
  validateWorkflow,
  getWorkflowTemplates,
  createFromTemplate,
  exportWorkflow
} = require('../../controllers/appControllers/workflowController');

const { protect, authorize } = require('../../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Workflow Templates Routes (public within organization)
router.get('/templates', getWorkflowTemplates);
router.post('/templates/:templateId', authorize('admin', 'manager', 'workflow_designer'), createFromTemplate);

// Main Workflow Routes
router.route('/')
  .get(getWorkflows)
  .post(authorize('admin', 'manager', 'workflow_designer'), createWorkflow);

router.route('/:id')
  .get(getWorkflow)
  .put(authorize('admin', 'manager', 'workflow_designer'), updateWorkflow)
  .delete(authorize('admin', 'manager'), deleteWorkflow);

// Workflow Execution Routes
router.post('/:id/execute', authorize('admin', 'manager', 'workflow_executor'), executeWorkflow);
router.get('/:id/executions', getExecutionHistory);

// Workflow Management Routes
router.patch('/:id/toggle', authorize('admin', 'manager'), toggleWorkflow);
router.post('/:id/validate', authorize('admin', 'manager', 'workflow_designer'), validateWorkflow);

// Analytics and Reporting Routes
router.get('/:id/stats', getWorkflowStats);
router.get('/:id/export', authorize('admin', 'manager'), exportWorkflow);

module.exports = router; 