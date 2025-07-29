const express = require('express');
const messageController = require('../../controllers/appControllers/messageController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/', messageController.getAllMessages);
router.post('/', messageController.createMessage);
router.put('/:id/read', messageController.markAsRead);
router.delete('/conversation/:conversationId', messageController.deleteConversation);

module.exports = router; 