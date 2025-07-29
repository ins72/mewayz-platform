const express = require('express');
const followerController = require('../../controllers/appControllers/followerController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/follow/:userId', followerController.follow);
router.delete('/unfollow/:userId', followerController.unfollow);
router.get('/:userId?', followerController.getFollowers);
router.get('/following/:userId?', followerController.getFollowing);

module.exports = router; 