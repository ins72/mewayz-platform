const express = require('express');
const commentController = require('../../controllers/appControllers/commentController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getComment);
router.get('/:commentId/replies', commentController.getReplies);

// Protected routes
router.use(authController.protect);

router.post('/', commentController.createComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.put('/:id/mark', commentController.markComment);

module.exports = router; 