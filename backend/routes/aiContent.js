const express = require('express');
const {
  createContentRepurposing,
  getContentRepurposing,
  createAIVideo,
  getAIVideos,
  getContentSuggestions,
  createVoiceProfile,
  getVoiceProfiles,
  updateSuggestionPreferences
} = require('../controllers/aiContentController');

const { protect } = require('../middleware/auth');
const router = express.Router();

// Content Repurposing Routes
router.route('/content/repurpose')
  .post(protect, createContentRepurposing)
  .get(protect, getContentRepurposing);

// AI Video Creation Routes
router.route('/video')
  .post(protect, createAIVideo)
  .get(protect, getAIVideos);

router.route('/video/create')
  .post(protect, createAIVideo);

// Content Suggestions Routes
router.route('/suggestions')
  .get(protect, getContentSuggestions);

router.route('/suggestions/preferences')
  .put(protect, updateSuggestionPreferences);

// Voice Profile Routes
router.route('/voice-profile')
  .post(protect, createVoiceProfile)
  .get(protect, getVoiceProfiles);

module.exports = router; 