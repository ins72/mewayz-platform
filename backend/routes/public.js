const express = require('express');
const {
    getPublicStats,
    getPublicContent,
    getPublicTestimonials,
    submitTestimonial,
    getPublicMilestones,
    getCompanyStats,
    getCompanyTeam,
    getLiveAnalytics,
    getSystemStatus,
    searchPublicContent
} = require('../controllers/publicController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/stats', getPublicStats);
router.get('/content/:key', getPublicContent);
router.get('/testimonials', getPublicTestimonials);
router.post('/testimonials', submitTestimonial);
router.get('/milestones', getPublicMilestones);
router.get('/company/stats', getCompanyStats);
router.get('/company/team', getCompanyTeam);
router.get('/analytics/live', getLiveAnalytics);
router.get('/status', getSystemStatus);
router.get('/search', searchPublicContent);

module.exports = router; 
