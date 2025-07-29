const WorkflowEngine = require('../../models/appModels/WorkflowEngine');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all workflows for organization
// @route   GET /api/workflows
// @access  Private
exports.getWorkflows = asyncHandler(async (req, res, next) => {
  const workflows = await WorkflowEngine.find({ 
    organization_id: req.user.organization_id 
  }).sort({ created_at: -1 });

  res.status(200).json({
    success: true,
    count: workflows.length,
    data: workflows
  });
});

// @desc    Get single workflow
// @route   GET /api/workflows/:id
// @access  Private
exports.getWorkflow = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  res.status(200).json({
    success: true,
    data: workflow
  });
});

// @desc    Create new workflow
// @route   POST /api/workflows
// @access  Private
exports.createWorkflow = asyncHandler(async (req, res, next) => {
  req.body.organization_id = req.user.organization_id;

  const workflow = await WorkflowEngine.create(req.body);

  res.status(201).json({
    success: true,
    data: workflow
  });
});

// @desc    Update workflow
// @route   PUT /api/workflows/:id
// @access  Private
exports.updateWorkflow = asyncHandler(async (req, res, next) => {
  let workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  workflow = await WorkflowEngine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: workflow
  });
});

// @desc    Delete workflow
// @route   DELETE /api/workflows/:id
// @access  Private
exports.deleteWorkflow = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  await workflow.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Execute workflow
// @route   POST /api/workflows/:id/execute
// @access  Private
exports.executeWorkflow = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  if (!workflow.settings.enabled) {
    return next(new ErrorResponse('Workflow is disabled', 400));
  }

  try {
    const execution = await workflow.executeWorkflow(req.body.triggerData || {});
    
    res.status(200).json({
      success: true,
      data: execution
    });
  } catch (error) {
    return next(new ErrorResponse('Workflow execution failed: ' + error.message, 500));
  }
});

// @desc    Get workflow execution history
// @route   GET /api/workflows/:id/executions
// @access  Private
exports.getExecutionHistory = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const executions = workflow.execution_history
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
    .slice(skip, skip + parseInt(limit));

  res.status(200).json({
    success: true,
    count: executions.length,
    total: workflow.execution_history.length,
    data: executions
  });
});

// @desc    Get workflow statistics
// @route   GET /api/workflows/:id/stats
// @access  Private
exports.getWorkflowStats = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  const stats = {
    basic: workflow.statistics,
    recent_executions: workflow.execution_history
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      .slice(0, 10)
      .map(exec => ({
        execution_id: exec.execution_id,
        status: exec.status,
        started_at: exec.started_at,
        completed_at: exec.completed_at,
        execution_time_ms: exec.execution_time_ms,
        steps_completed: exec.steps_completed.length,
        total_steps: workflow.steps.length,
        errors: exec.errors.length
      })),
    performance_by_step: workflow.steps.map(step => {
      const stepExecutions = workflow.execution_history.filter(exec =>
        exec.steps_completed.includes(step.step_id)
      );
      const stepErrors = workflow.execution_history.reduce((acc, exec) =>
        acc + exec.errors.filter(err => err.step_id === step.step_id).length, 0
      );

      return {
        step_id: step.step_id,
        step_name: step.step_name,
        executions: stepExecutions.length,
        errors: stepErrors,
        success_rate: stepExecutions.length > 0 ? 
          ((stepExecutions.length - stepErrors) / stepExecutions.length) * 100 : 0
      };
    }),
    error_summary: {
      total_errors: workflow.execution_history.reduce((acc, exec) => acc + exec.errors.length, 0),
      error_types: workflow.execution_history.reduce((acc, exec) => {
        exec.errors.forEach(error => {
          acc[error.step_id] = (acc[error.step_id] || 0) + 1;
        });
        return acc;
      }, {}),
      most_recent_errors: workflow.execution_history
        .flatMap(exec => exec.errors)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    }
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Pause/Resume workflow
// @route   PATCH /api/workflows/:id/toggle
// @access  Private
exports.toggleWorkflow = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  workflow.settings.enabled = !workflow.settings.enabled;
  await workflow.save();

  res.status(200).json({
    success: true,
    data: {
      enabled: workflow.settings.enabled,
      message: workflow.settings.enabled ? 'Workflow enabled' : 'Workflow disabled'
    }
  });
});

// @desc    Validate workflow configuration
// @route   POST /api/workflows/:id/validate
// @access  Private
exports.validateWorkflow = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  const validationResults = {
    valid: true,
    warnings: [],
    errors: []
  };

  // Validate trigger configuration
  if (!workflow.trigger || !workflow.trigger.type) {
    validationResults.errors.push('Workflow must have a trigger defined');
    validationResults.valid = false;
  }

  // Validate steps
  if (!workflow.steps || workflow.steps.length === 0) {
    validationResults.errors.push('Workflow must have at least one step');
    validationResults.valid = false;
  }

  // Check for orphaned steps
  const connectedSteps = new Set();
  workflow.steps.forEach(step => {
    step.next_steps.forEach(next => {
      connectedSteps.add(next.step_id);
    });
  });

  workflow.steps.forEach(step => {
    if (!connectedSteps.has(step.step_id) && workflow.steps.length > 1) {
      const isFirstStep = !workflow.steps.some(otherStep =>
        otherStep.next_steps.some(next => next.step_id === step.step_id)
      );
      if (!isFirstStep) {
        validationResults.warnings.push(`Step "${step.step_name}" appears to be disconnected`);
      }
    }
  });

  // Validate step configurations
  workflow.steps.forEach(step => {
    if (!step.step_name) {
      validationResults.errors.push(`Step ${step.step_id} is missing a name`);
      validationResults.valid = false;
    }
    
    if (!step.step_type) {
      validationResults.errors.push(`Step ${step.step_id} is missing a type`);
      validationResults.valid = false;
    }
    
    // Check for circular references
    const visited = new Set();
    const checkCircular = (currentStepId, path = []) => {
      if (path.includes(currentStepId)) {
        validationResults.errors.push(`Circular reference detected in workflow path: ${path.join(' -> ')} -> ${currentStepId}`);
        validationResults.valid = false;
        return;
      }
      
      if (visited.has(currentStepId)) return;
      visited.add(currentStepId);
      
      const currentStep = workflow.steps.find(s => s.step_id === currentStepId);
      if (currentStep) {
        currentStep.next_steps.forEach(next => {
          checkCircular(next.step_id, [...path, currentStepId]);
        });
      }
    };
    
    checkCircular(step.step_id);
  });

  // Validate permissions
  if (workflow.permissions) {
    const allUserIds = [
      ...(workflow.permissions.viewers || []),
      ...(workflow.permissions.editors || []),
      ...(workflow.permissions.approvers || [])
    ];
    
    if (allUserIds.length === 0) {
      validationResults.warnings.push('No users have been granted permissions to this workflow');
    }
  }

  res.status(200).json({
    success: true,
    data: validationResults
  });
});

// @desc    Get workflow templates
// @route   GET /api/workflows/templates
// @access  Private
exports.getWorkflowTemplates = asyncHandler(async (req, res, next) => {
  const templates = [
    {
      id: 'lead_qualification',
      name: 'Lead Qualification',
      description: 'Automatically qualify leads based on score and activity',
      category: 'sales',
      trigger: { type: 'form_submission' },
      steps: [
        {
          step_id: 'score_lead',
          step_name: 'Score Lead',
          step_type: 'action',
          order: 1,
          description: 'Calculate lead score based on form data'
        },
        {
          step_id: 'check_score',
          step_name: 'Check Score Threshold',
          step_type: 'condition',
          order: 2,
          description: 'Determine if lead meets qualification criteria'
        },
        {
          step_id: 'assign_sales',
          step_name: 'Assign to Sales',
          step_type: 'action',
          order: 3,
          description: 'Assign qualified lead to sales representative'
        },
        {
          step_id: 'send_nurture',
          step_name: 'Send to Nurture Campaign',
          step_type: 'action',
          order: 4,
          description: 'Add unqualified lead to nurture campaign'
        }
      ],
      estimated_setup_time: 15,
      complexity: 'beginner'
    },
    {
      id: 'customer_onboarding',
      name: 'Customer Onboarding',
      description: 'Welcome new customers with automated email sequence',
      category: 'marketing',
      trigger: { type: 'data_change' },
      steps: [
        {
          step_id: 'welcome_email',
          step_name: 'Send Welcome Email',
          step_type: 'email',
          order: 1,
          description: 'Send personalized welcome email'
        },
        {
          step_id: 'wait_24h',
          step_name: 'Wait 24 Hours',
          step_type: 'delay',
          order: 2,
          description: 'Wait before sending next email'
        },
        {
          step_id: 'setup_guide',
          step_name: 'Send Setup Guide',
          step_type: 'email',
          order: 3,
          description: 'Send getting started guide'
        },
        {
          step_id: 'create_task',
          step_name: 'Create Follow-up Task',
          step_type: 'action',
          order: 4,
          description: 'Create task for customer success team'
        }
      ],
      estimated_setup_time: 20,
      complexity: 'intermediate'
    },
    {
      id: 'support_ticket_routing',
      name: 'Support Ticket Routing',
      description: 'Route tickets to appropriate agents based on priority',
      category: 'support',
      trigger: { type: 'webhook' },
      steps: [
        {
          step_id: 'analyze_ticket',
          step_name: 'Analyze Ticket',
          step_type: 'action',
          order: 1,
          description: 'Analyze ticket content and determine priority'
        },
        {
          step_id: 'check_priority',
          step_name: 'Check Priority Level',
          step_type: 'condition',
          order: 2,
          description: 'Route based on ticket priority'
        },
        {
          step_id: 'assign_agent',
          step_name: 'Assign to Agent',
          step_type: 'action',
          order: 3,
          description: 'Assign to appropriate support agent'
        },
        {
          step_id: 'notify_customer',
          step_name: 'Notify Customer',
          step_type: 'email',
          order: 4,
          description: 'Send confirmation to customer'
        }
      ],
      estimated_setup_time: 25,
      complexity: 'intermediate'
    }
  ];

  res.status(200).json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// @desc    Create workflow from template
// @route   POST /api/workflows/templates/:templateId
// @access  Private
exports.createFromTemplate = asyncHandler(async (req, res, next) => {
  const { templateId } = req.params;
  const { workflow_name, customizations = {} } = req.body;

  // This would fetch template from a templates service
  // For now, return an error if template not found
  if (!['lead_qualification', 'customer_onboarding', 'support_ticket_routing'].includes(templateId)) {
    return next(new ErrorResponse('Template not found', 404));
  }

  const workflowData = {
    organization_id: req.user.organization_id,
    workflow_name: workflow_name || `Workflow from ${templateId}`,
    description: `Created from ${templateId} template`,
    category: 'custom',
    trigger: { type: 'manual', config: {} },
    steps: [], // Would be populated from template
    settings: {
      enabled: false,
      max_concurrent_executions: 10,
      execution_timeout_minutes: 120,
      debug_mode: true
    },
    ...customizations
  };

  const workflow = await WorkflowEngine.create(workflowData);

  res.status(201).json({
    success: true,
    data: workflow
  });
});

// @desc    Export workflow definition
// @route   GET /api/workflows/:id/export
// @access  Private
exports.exportWorkflow = asyncHandler(async (req, res, next) => {
  const workflow = await WorkflowEngine.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!workflow) {
    return next(new ErrorResponse('Workflow not found', 404));
  }

  const exportData = {
    workflow_definition: {
      workflow_name: workflow.workflow_name,
      description: workflow.description,
      category: workflow.category,
      trigger: workflow.trigger,
      steps: workflow.steps,
      variables: workflow.variables
    },
    metadata: {
      exported_at: new Date(),
      exported_by: req.user.id,
      version: workflow.version,
      statistics: workflow.statistics
    }
  };

  res.status(200).json({
    success: true,
    data: exportData
  });
}); 