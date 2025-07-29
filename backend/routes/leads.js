const express = require('express');
const {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    getLeadStats
} = require('../controllers/leadController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Public routes (for authenticated users)
router.route('/')
    .get(getLeads)
    .post(createLead);

router.route('/stats')
    .get(getLeadStats);

router.route('/:id')
    .get(getLead)
    .put(updateLead)
    .delete(authorize('admin', 'moderator'), deleteLead);

module.exports = router; 
