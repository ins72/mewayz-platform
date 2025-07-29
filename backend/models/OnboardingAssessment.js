const mongoose = require('mongoose');

const OnboardingAssessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    businessType: {
        id: {
            type: String,
            required: true,
            enum: ['ecommerce', 'creator', 'educator', 'consultant', 'agency', 'nonprofit']
        },
        name: {
            type: String,
            required: true
        },
        icon: String,
        description: String,
        features: [String]
    },
    experienceLevel: {
        id: {
            type: String,
            required: true,
            enum: ['beginner', 'basic', 'intermediate', 'advanced', 'expert']
        },
        name: {
            type: String,
            required: true
        },
        description: String,
        icon: String
    },
    goals: [{
        id: {
            type: String,
            enum: ['revenue', 'audience', 'products', 'automate', 'scale']
        },
        name: String,
        icon: String
    }],
    painPoints: [{
        id: {
            type: String,
            enum: ['tools', 'costs', 'integrations', 'time', 'skills', 'support']
        },
        name: String,
        icon: String
    }],
    goalsDetails: {
        revenue: {
            amount: String,
            timeline: String
        },
        audience: {
            size: String,
            niche: String
        },
        products: {
            type: String,
            quantity: String
        },
        automate: {
            processes: [String]
        },
        scale: {
            currentSize: String,
            targetSize: String
        }
    },
    workspaceName: {
        type: String,
        required: true,
        trim: true
    },
    workspaceDescription: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String
    },
    recommendations: [{
        type: {
            type: String,
            enum: ['feature', 'tutorial', 'integration', 'optimization']
        },
        title: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        },
        estimatedTime: String,
        category: String,
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date
    }],
    milestones: [{
        name: String,
        points: Number,
        completed: {
            type: Boolean,
            default: false
        },
        category: String,
        completedAt: Date
    }],
    dashboardConfig: {
        widgets: [{
            type: String,
            position: {
                x: Number,
                y: Number,
                width: Number,
                height: Number
            }
        }],
        theme: {
            type: String,
            default: 'default'
        },
        layout: {
            type: String,
            default: 'grid'
        },
        autoRefresh: {
            type: Boolean,
            default: true
        },
        refreshInterval: {
            type: Number,
            default: 30000
        }
    },
    progress: {
        currentStep: {
            type: String,
            default: 'not_started'
        },
        stepsCompleted: [String],
        totalSteps: {
            type: Number,
            default: 4
        },
        completionPercentage: {
            type: Number,
            default: 0
        }
    },
    preferences: {
        communicationChannel: {
            type: String,
            enum: ['email', 'sms', 'push', 'in-app'],
            default: 'email'
        },
        notificationFrequency: {
            type: String,
            enum: ['immediate', 'daily', 'weekly'],
            default: 'daily'
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
OnboardingAssessmentSchema.index({ userId: 1, organizationId: 1 });
OnboardingAssessmentSchema.index({ businessType: 1 });
OnboardingAssessmentSchema.index({ completedAt: -1 });

// Method to update progress
OnboardingAssessmentSchema.methods.updateProgress = function(step) {
    if (!this.progress.stepsCompleted.includes(step)) {
        this.progress.stepsCompleted.push(step);
    }
    
    this.progress.currentStep = step;
    this.progress.completionPercentage = Math.round(
        (this.progress.stepsCompleted.length / this.progress.totalSteps) * 100
    );
    
    this.lastUpdated = new Date();
    return this.save();
};

// Method to mark recommendation as completed
OnboardingAssessmentSchema.methods.completeRecommendation = function(recommendationTitle) {
    const recommendation = this.recommendations.find(r => r.title === recommendationTitle);
    if (recommendation) {
        recommendation.completed = true;
        recommendation.completedAt = new Date();
        this.lastUpdated = new Date();
        return this.save();
    }
    return Promise.reject(new Error('Recommendation not found'));
};

// Method to mark milestone as completed
OnboardingAssessmentSchema.methods.completeMilestone = function(milestoneName) {
    const milestone = this.milestones.find(m => m.name === milestoneName);
    if (milestone) {
        milestone.completed = true;
        milestone.completedAt = new Date();
        this.lastUpdated = new Date();
        return this.save();
    }
    return Promise.reject(new Error('Milestone not found'));
};

// Static method to get assessment by user
OnboardingAssessmentSchema.statics.findByUser = function(userId) {
    return this.findOne({ userId }).populate('organizationId');
};

// Static method to get assessment by organization
OnboardingAssessmentSchema.statics.findByOrganization = function(organizationId) {
    return this.findOne({ organizationId }).populate('userId');
};

// Pre-save middleware to update lastUpdated
OnboardingAssessmentSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

module.exports = mongoose.model('OnboardingAssessment', OnboardingAssessmentSchema); 