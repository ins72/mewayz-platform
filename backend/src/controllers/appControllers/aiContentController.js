const AIContentGenerator = require('../../models/appModels/AIContentGenerator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all AI content projects for organization
// @route   GET /api/ai-content/projects
// @access  Private
exports.getContentProjects = asyncHandler(async (req, res, next) => {
  const projects = await AIContentGenerator.find({ 
    organization_id: req.user.organization_id 
  }).sort({ created_at: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get single AI content project
// @route   GET /api/ai-content/projects/:id
// @access  Private
exports.getContentProject = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Create new AI content project
// @route   POST /api/ai-content/projects
// @access  Private
exports.createContentProject = asyncHandler(async (req, res, next) => {
  req.body.organization_id = req.user.organization_id;

  const project = await AIContentGenerator.create(req.body);

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Update AI content project
// @route   PUT /api/ai-content/projects/:id
// @access  Private
exports.updateContentProject = asyncHandler(async (req, res, next) => {
  let project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  project = await AIContentGenerator.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete AI content project
// @route   DELETE /api/ai-content/projects/:id
// @access  Private
exports.deleteContentProject = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  await project.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Generate AI content
// @route   POST /api/ai-content/projects/:id/generate
// @access  Private
exports.generateContent = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  try {
    const generatedContent = await project.generateContent(req.body.customPrompt || '');
    
    await project.save();

    res.status(200).json({
      success: true,
      data: generatedContent
    });
  } catch (error) {
    return next(new ErrorResponse('Content generation failed', 500));
  }
});

// @desc    Get content performance analytics
// @route   GET /api/ai-content/projects/:id/analytics
// @access  Private
exports.getContentAnalytics = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  const analytics = {
    total_generated: project.generated_content.length,
    published_content: project.generated_content.filter(c => c.approval_status === 'published').length,
    average_performance: project.generated_content.reduce((acc, content) => {
      return acc + (content.metadata.content_quality_score || 0);
    }, 0) / project.generated_content.length || 0,
    performance_by_type: {},
    engagement_metrics: {
      total_views: project.generated_content.reduce((acc, content) => acc + (content.performance_data.engagement_rate || 0), 0),
      total_conversions: project.generated_content.reduce((acc, content) => acc + (content.performance_data.conversion_rate || 0), 0),
      avg_time_on_page: project.generated_content.reduce((acc, content) => acc + (content.performance_data.time_on_page || 0), 0) / project.generated_content.length || 0
    },
    cost_analysis: {
      total_cost: project.cost_tracking.total_monthly_cost || 0,
      cost_per_content: project.cost_tracking.cost_per_content_piece || 0,
      budget_utilization: project.cost_tracking.budget_alerts ? 
        (project.cost_tracking.budget_alerts.current_usage / project.cost_tracking.budget_alerts.monthly_limit) * 100 : 0
    }
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Optimize content based on performance
// @route   POST /api/ai-content/projects/:id/optimize/:contentId
// @access  Private
exports.optimizeContent = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  try {
    const optimizations = await project.optimizeContent(req.params.contentId);
    
    await project.save();

    res.status(200).json({
      success: true,
      data: optimizations
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Run A/B test for content
// @route   POST /api/ai-content/projects/:id/ab-test
// @access  Private
exports.runABTest = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  const { variantAId, variantBId, testMetrics } = req.body;

  if (!variantAId || !variantBId || !testMetrics) {
    return next(new ErrorResponse('Missing required test parameters', 400));
  }

  try {
    const abTest = await project.runABTest(variantAId, variantBId, testMetrics);
    
    await project.save();

    res.status(200).json({
      success: true,
      data: abTest
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get content templates
// @route   GET /api/ai-content/templates
// @access  Private
exports.getContentTemplates = asyncHandler(async (req, res, next) => {
  const projects = await AIContentGenerator.find({ 
    organization_id: req.user.organization_id 
  });

  const allTemplates = projects.reduce((acc, project) => {
    return acc.concat(project.content_templates);
  }, []);

  // Sort by effectiveness score
  allTemplates.sort((a, b) => (b.effectiveness_score || 0) - (a.effectiveness_score || 0));

  res.status(200).json({
    success: true,
    count: allTemplates.length,
    data: allTemplates
  });
});

// @desc    Update AI model configuration
// @route   PUT /api/ai-content/model-config/:id
// @access  Private
exports.updateModelConfig = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  project.ai_model_config = { ...project.ai_model_config, ...req.body };
  await project.save();

  res.status(200).json({
    success: true,
    data: project.ai_model_config
  });
});

// @desc    Get cost tracking data
// @route   GET /api/ai-content/projects/:id/costs
// @access  Private
exports.getCostTracking = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  const costData = {
    current_month: {
      total_cost: project.cost_tracking.total_monthly_cost || 0,
      api_usage: project.cost_tracking.api_usage_costs || [],
      cost_per_content: project.cost_tracking.cost_per_content_piece || 0
    },
    budget_status: {
      monthly_limit: project.cost_tracking.budget_alerts?.monthly_limit || 0,
      current_usage: project.cost_tracking.budget_alerts?.current_usage || 0,
      remaining_budget: (project.cost_tracking.budget_alerts?.monthly_limit || 0) - (project.cost_tracking.budget_alerts?.current_usage || 0),
      utilization_percentage: project.cost_tracking.budget_alerts ? 
        (project.cost_tracking.budget_alerts.current_usage / project.cost_tracking.budget_alerts.monthly_limit) * 100 : 0
    },
    cost_trends: project.cost_tracking.api_usage_costs?.slice(-7) || [] // Last 7 days
  };

  res.status(200).json({
    success: true,
    data: costData
  });
});

// @desc    Export content analytics report
// @route   GET /api/ai-content/projects/:id/export
// @access  Private
exports.exportAnalyticsReport = asyncHandler(async (req, res, next) => {
  const project = await AIContentGenerator.findOne({
    _id: req.params.id,
    organization_id: req.user.organization_id
  });

  if (!project) {
    return next(new ErrorResponse('Content project not found', 404));
  }

  const report = {
    project_info: {
      name: project.content_project_name,
      type: project.content_type,
      created_at: project.created_at,
      target_audience: project.content_parameters.target_audience
    },
    content_summary: {
      total_generated: project.generated_content.length,
      published: project.generated_content.filter(c => c.approval_status === 'published').length,
      pending_review: project.generated_content.filter(c => c.approval_status === 'pending_review').length,
      rejected: project.generated_content.filter(c => c.approval_status === 'rejected').length
    },
    performance_metrics: project.generated_content.map(content => ({
      content_id: content.generation_id,
      word_count: content.metadata.word_count,
      quality_score: content.metadata.content_quality_score,
      seo_score: content.metadata.seo_score,
      engagement_rate: content.performance_data.engagement_rate,
      conversion_rate: content.performance_data.conversion_rate,
      generated_at: content.generated_at,
      status: content.approval_status
    })),
    cost_analysis: project.cost_tracking,
    generated_at: new Date()
  };

  res.status(200).json({
    success: true,
    data: report
  });
}); 