const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Organization = require('../models/Organization');
const OnboardingAssessment = require('../models/OnboardingAssessment');

// @desc    Complete intelligent onboarding assessment
// @route   POST /api/v1/onboarding/intelligent
// @access  Private
router.post('/intelligent', auth.protect, asyncHandler(async (req, res, next) => {
    const { assessment, goalsDetails } = req.body;

    // Validate required fields
    if (!assessment.businessType || !assessment.experienceLevel || !assessment.workspaceName) {
        return next(new ErrorResponse('Missing required assessment data', 400));
    }

    try {
        // Create or update organization
        let organization = await Organization.findOne({ 
            owner: req.user.id,
            name: assessment.workspaceName 
        });

        if (!organization) {
            organization = await Organization.create({
                name: assessment.workspaceName,
                description: assessment.workspaceDescription || '',
                owner: req.user.id,
                businessType: assessment.businessType.id,
                experienceLevel: assessment.experienceLevel.id,
                goals: assessment.goals.map(g => g.id),
                painPoints: assessment.painPoints.map(p => p.id),
                goalsDetails: goalsDetails,
                onboardingCompleted: true,
                onboardingData: assessment,
                settings: {
                    theme: 'default',
                    language: 'en',
                    timezone: 'UTC',
                    currency: 'USD'
                }
            });
        } else {
            // Update existing organization
            organization.businessType = assessment.businessType.id;
            organization.experienceLevel = assessment.experienceLevel.id;
            organization.goals = assessment.goals.map(g => g.id);
            organization.painPoints = assessment.painPoints.map(p => p.id);
            organization.goalsDetails = goalsDetails;
            organization.onboardingCompleted = true;
            organization.onboardingData = assessment;
            await organization.save();
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                organizationId: organization._id,
                businessType: assessment.businessType.id,
                experienceLevel: assessment.experienceLevel.id,
                onboardingCompleted: true,
                onboardingStep: 'completed',
                lastOnboardingUpdate: new Date(),
                profileImage: assessment.profileImage || req.user.profileImage
            },
            { new: true, runValidators: true }
        );

        // Create onboarding assessment record
        const onboardingAssessment = await OnboardingAssessment.create({
            userId: req.user.id,
            organizationId: organization._id,
            businessType: assessment.businessType,
            experienceLevel: assessment.experienceLevel,
            goals: assessment.goals,
            painPoints: assessment.painPoints,
            goalsDetails: goalsDetails,
            workspaceName: assessment.workspaceName,
            workspaceDescription: assessment.workspaceDescription,
            completedAt: new Date()
        });

        // Generate personalized recommendations
        const recommendations = await generatePersonalizedRecommendations(assessment, organization._id);

        // Create initial success milestones
        const milestones = await createInitialMilestones(organization._id, assessment.businessType.id);

        // Set up personalized dashboard configuration
        const dashboardConfig = await createDashboardConfiguration(organization._id, assessment);

        res.status(200).json({
            success: true,
            message: 'Intelligent onboarding completed successfully',
            data: {
                user: updatedUser,
                organization,
                assessment: onboardingAssessment,
                recommendations,
                milestones,
                dashboardConfig
            }
        });

    } catch (error) {
        console.error('Onboarding error:', error);
        return next(new ErrorResponse('Error completing onboarding', 500));
    }
}));

// @desc    Get onboarding progress
// @route   GET /api/v1/onboarding/progress
// @access  Private
router.get('/progress', auth.protect, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('organizationId');
    
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const progress = {
        completed: user.onboardingCompleted || false,
        step: user.onboardingStep || 'not_started',
        businessType: user.businessType,
        experienceLevel: user.experienceLevel,
        organization: user.organizationId,
        lastUpdate: user.lastOnboardingUpdate
    };

    res.status(200).json({
        success: true,
        data: progress
    });
}));

// @desc    Update onboarding step
// @route   PUT /api/v1/onboarding/step
// @access  Private
router.put('/step', auth.protect, asyncHandler(async (req, res, next) => {
    const { step, data } = req.body;

    const updateData = {
        onboardingStep: step,
        lastOnboardingUpdate: new Date()
    };

    // Add step-specific data
    if (data) {
        Object.assign(updateData, data);
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: user
    });
}));

// @desc    Get personalized recommendations
// @route   GET /api/v1/onboarding/recommendations
// @access  Private
router.get('/recommendations', auth.protect, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('organizationId');
    
    if (!user || !user.organizationId) {
        return next(new ErrorResponse('User or organization not found', 404));
    }

    const recommendations = await generatePersonalizedRecommendations(
        user.organizationId.onboardingData,
        user.organizationId._id
    );

    res.status(200).json({
        success: true,
        data: recommendations
    });
}));

// Helper function to generate personalized recommendations
async function generatePersonalizedRecommendations(assessment, organizationId) {
    const recommendations = [];

    // Business type specific recommendations
    switch (assessment.businessType.id) {
        case 'ecommerce':
            recommendations.push(
                { type: 'feature', title: 'Set up your first product', priority: 'high', estimatedTime: '5 minutes', category: 'setup' },
                { type: 'feature', title: 'Configure payment gateways', priority: 'high', estimatedTime: '10 minutes', category: 'setup' },
                { type: 'feature', title: 'Set up shipping zones', priority: 'medium', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'tutorial', title: 'E-commerce Best Practices', priority: 'medium', estimatedTime: '20 minutes', category: 'learning' },
                { type: 'feature', title: 'Inventory management setup', priority: 'medium', estimatedTime: '15 minutes', category: 'setup' }
            );
            break;
        case 'creator':
            recommendations.push(
                { type: 'feature', title: 'Connect social media accounts', priority: 'high', estimatedTime: '5 minutes', category: 'setup' },
                { type: 'feature', title: 'Set up content calendar', priority: 'high', estimatedTime: '10 minutes', category: 'setup' },
                { type: 'feature', title: 'Configure monetization options', priority: 'medium', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'tutorial', title: 'Content Creation Strategy', priority: 'medium', estimatedTime: '25 minutes', category: 'learning' },
                { type: 'feature', title: 'Audience analytics setup', priority: 'medium', estimatedTime: '10 minutes', category: 'setup' }
            );
            break;
        case 'educator':
            recommendations.push(
                { type: 'feature', title: 'Create your first course', priority: 'high', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'feature', title: 'Set up student enrollment', priority: 'high', estimatedTime: '10 minutes', category: 'setup' },
                { type: 'feature', title: 'Configure payment processing', priority: 'medium', estimatedTime: '10 minutes', category: 'setup' },
                { type: 'tutorial', title: 'Course Creation Best Practices', priority: 'medium', estimatedTime: '30 minutes', category: 'learning' },
                { type: 'feature', title: 'Certificate generation setup', priority: 'medium', estimatedTime: '15 minutes', category: 'setup' }
            );
            break;
        case 'consultant':
            recommendations.push(
                { type: 'feature', title: 'Set up client management', priority: 'high', estimatedTime: '10 minutes', category: 'setup' },
                { type: 'feature', title: 'Create service packages', priority: 'high', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'feature', title: 'Configure invoicing system', priority: 'medium', estimatedTime: '10 minutes', category: 'setup' },
                { type: 'tutorial', title: 'Consulting Business Setup', priority: 'medium', estimatedTime: '20 minutes', category: 'learning' },
                { type: 'feature', title: 'Project tracking setup', priority: 'medium', estimatedTime: '15 minutes', category: 'setup' }
            );
            break;
        case 'agency':
            recommendations.push(
                { type: 'feature', title: 'Set up team collaboration', priority: 'high', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'feature', title: 'Configure client portals', priority: 'high', estimatedTime: '20 minutes', category: 'setup' },
                { type: 'feature', title: 'Set up project management', priority: 'medium', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'tutorial', title: 'Agency Operations Guide', priority: 'medium', estimatedTime: '30 minutes', category: 'learning' },
                { type: 'feature', title: 'Advanced analytics setup', priority: 'medium', estimatedTime: '20 minutes', category: 'setup' }
            );
            break;
        case 'nonprofit':
            recommendations.push(
                { type: 'feature', title: 'Set up donation system', priority: 'high', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'feature', title: 'Configure volunteer management', priority: 'high', estimatedTime: '20 minutes', category: 'setup' },
                { type: 'feature', title: 'Set up impact tracking', priority: 'medium', estimatedTime: '15 minutes', category: 'setup' },
                { type: 'tutorial', title: 'Nonprofit Management Guide', priority: 'medium', estimatedTime: '25 minutes', category: 'learning' },
                { type: 'feature', title: 'Grant management setup', priority: 'medium', estimatedTime: '20 minutes', category: 'setup' }
            );
            break;
    }

    // Experience level specific recommendations
    if (assessment.experienceLevel.id === 'beginner') {
        recommendations.push(
            { type: 'tutorial', title: 'Platform Basics', priority: 'high', estimatedTime: '30 minutes', category: 'learning' },
            { type: 'tutorial', title: 'Getting Started Guide', priority: 'high', estimatedTime: '45 minutes', category: 'learning' }
        );
    }

    // Goals specific recommendations
    assessment.goals.forEach((goal) => {
        switch (goal.id) {
            case 'revenue':
                recommendations.push(
                    { type: 'feature', title: 'Revenue Tracking Setup', priority: 'high', estimatedTime: '10 minutes', category: 'setup' },
                    { type: 'tutorial', title: 'Revenue Optimization Strategies', priority: 'medium', estimatedTime: '20 minutes', category: 'learning' }
                );
                break;
            case 'audience':
                recommendations.push(
                    { type: 'feature', title: 'Audience Analytics Setup', priority: 'high', estimatedTime: '10 minutes', category: 'setup' },
                    { type: 'tutorial', title: 'Audience Growth Strategies', priority: 'medium', estimatedTime: '25 minutes', category: 'learning' }
                );
                break;
            case 'automate':
                recommendations.push(
                    { type: 'feature', title: 'Automation Workflow Setup', priority: 'high', estimatedTime: '15 minutes', category: 'setup' },
                    { type: 'tutorial', title: 'Business Automation Guide', priority: 'medium', estimatedTime: '30 minutes', category: 'learning' }
                );
                break;
        }
    });

    return recommendations;
}

// Helper function to create initial milestones
async function createInitialMilestones(organizationId, businessType) {
    const baseMilestones = [
        { name: 'Complete Profile', points: 100, completed: true, category: 'profile' },
        { name: 'Workspace Setup', points: 200, completed: true, category: 'setup' },
        { name: 'First Feature Exploration', points: 150, completed: false, category: 'exploration' },
        { name: 'Complete First Tutorial', points: 250, completed: false, category: 'learning' },
        { name: 'Invite Team Member', points: 300, completed: false, category: 'collaboration' }
    ];

    // Business type specific milestones
    const businessMilestones = {
        ecommerce: [
            { name: 'Add First Product', points: 500, completed: false, category: 'ecommerce' },
            { name: 'Complete First Sale', points: 1000, completed: false, category: 'ecommerce' },
            { name: 'Reach $100 Revenue', points: 1500, completed: false, category: 'ecommerce' }
        ],
        creator: [
            { name: 'Connect Social Account', points: 500, completed: false, category: 'creator' },
            { name: 'Publish First Content', points: 1000, completed: false, category: 'creator' },
            { name: 'Reach 100 Followers', points: 1500, completed: false, category: 'creator' }
        ],
        educator: [
            { name: 'Create First Course', points: 500, completed: false, category: 'educator' },
            { name: 'Enroll First Student', points: 1000, completed: false, category: 'educator' },
            { name: 'Earn First $100', points: 1500, completed: false, category: 'educator' }
        ],
        consultant: [
            { name: 'Add First Client', points: 500, completed: false, category: 'consultant' },
            { name: 'Create First Invoice', points: 1000, completed: false, category: 'consultant' },
            { name: 'Complete First Project', points: 1500, completed: false, category: 'consultant' }
        ],
        agency: [
            { name: 'Add Team Member', points: 500, completed: false, category: 'agency' },
            { name: 'Onboard First Client', points: 1000, completed: false, category: 'agency' },
            { name: 'Complete First Project', points: 1500, completed: false, category: 'agency' }
        ],
        nonprofit: [
            { name: 'Set Up Donation Page', points: 500, completed: false, category: 'nonprofit' },
            { name: 'Receive First Donation', points: 1000, completed: false, category: 'nonprofit' },
            { name: 'Register First Volunteer', points: 1500, completed: false, category: 'nonprofit' }
        ]
    };

    return [...baseMilestones, ...(businessMilestones[businessType] || [])];
}

// Helper function to create dashboard configuration
async function createDashboardConfiguration(organizationId, assessment) {
    const baseWidgets = [
        { type: 'welcome', position: { x: 0, y: 0, width: 12, height: 2 } },
        { type: 'quickActions', position: { x: 0, y: 2, width: 6, height: 3 } },
        { type: 'recentActivity', position: { x: 6, y: 2, width: 6, height: 3 } }
    ];

    // Business type specific widgets
    const businessWidgets = {
        ecommerce: [
            { type: 'salesOverview', position: { x: 0, y: 5, width: 6, height: 4 } },
            { type: 'productPerformance', position: { x: 6, y: 5, width: 6, height: 4 } },
            { type: 'orderStatus', position: { x: 0, y: 9, width: 12, height: 3 } }
        ],
        creator: [
            { type: 'contentPerformance', position: { x: 0, y: 5, width: 6, height: 4 } },
            { type: 'audienceGrowth', position: { x: 6, y: 5, width: 6, height: 4 } },
            { type: 'revenueOverview', position: { x: 0, y: 9, width: 12, height: 3 } }
        ],
        educator: [
            { type: 'coursePerformance', position: { x: 0, y: 5, width: 6, height: 4 } },
            { type: 'studentProgress', position: { x: 6, y: 5, width: 6, height: 4 } },
            { type: 'revenueOverview', position: { x: 0, y: 9, width: 12, height: 3 } }
        ],
        consultant: [
            { type: 'clientOverview', position: { x: 0, y: 5, width: 6, height: 4 } },
            { type: 'projectStatus', position: { x: 6, y: 5, width: 6, height: 4 } },
            { type: 'revenueOverview', position: { x: 0, y: 9, width: 12, height: 3 } }
        ],
        agency: [
            { type: 'clientOverview', position: { x: 0, y: 5, width: 6, height: 4 } },
            { type: 'teamPerformance', position: { x: 6, y: 5, width: 6, height: 4 } },
            { type: 'projectStatus', position: { x: 0, y: 9, width: 12, height: 3 } }
        ],
        nonprofit: [
            { type: 'donationOverview', position: { x: 0, y: 5, width: 6, height: 4 } },
            { type: 'volunteerOverview', position: { x: 6, y: 5, width: 6, height: 4 } },
            { type: 'impactMetrics', position: { x: 0, y: 9, width: 12, height: 3 } }
        ]
    };

    return {
        widgets: [...baseWidgets, ...(businessWidgets[assessment.businessType.id] || [])],
        theme: 'default',
        layout: 'grid',
        autoRefresh: true,
        refreshInterval: 30000
    };
}

module.exports = router; 