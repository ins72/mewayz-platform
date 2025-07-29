const express = require('express');
const activeTimeController = require('../../controllers/appControllers/activeTimeController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.get('/:userId?', activeTimeController.getUserActiveTimes);
router.get('/:userId/stats', activeTimeController.getActiveTimeStats);

// Protected routes
router.use(authController.protect);

router.post('/', activeTimeController.createActiveTime);
router.put('/:id', activeTimeController.updateActiveTime);
router.delete('/:id', activeTimeController.deleteActiveTime);

module.exports = router; 