const express = require('express');
const userController = require('../../controllers/appControllers/userController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateProfile);

module.exports = router; 