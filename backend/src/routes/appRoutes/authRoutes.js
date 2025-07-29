const express = require('express');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authController.protect, authController.changePassword);

module.exports = router; 