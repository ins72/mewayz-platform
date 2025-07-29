const express = require('express');
const creatorController = require('../../controllers/appControllers/creatorController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Public routes
router.route('/top').get(creatorController.getTopCreators);
router.route('/search').get(creatorController.searchCreators);

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(creatorController.getAllCreators)
  .post(creatorController.createCreator);

router
  .route('/:id')
  .get(creatorController.getCreator)
  .patch(creatorController.updateCreator)
  .delete(creatorController.deleteCreator);

router.route('/:id/shop').get(creatorController.getCreatorShop);

module.exports = router; 