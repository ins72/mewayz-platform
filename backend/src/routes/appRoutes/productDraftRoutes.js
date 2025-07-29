const express = require('express');
const productDraftController = require('../../controllers/appControllers/productDraftController');
const authController = require('../../controllers/appControllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(productDraftController.getAllProductDrafts)
  .post(productDraftController.createProductDraft);

router
  .route('/:id')
  .get(productDraftController.getProductDraft)
  .patch(productDraftController.updateProductDraft)
  .delete(productDraftController.deleteProductDraft);

router.route('/user/:userId').get(productDraftController.getDraftsByUser);
router.route('/creator/:creatorId').get(productDraftController.getDraftsByCreator);
router.route('/:id/status').patch(productDraftController.updateDraftStatus);
router.route('/stats').get(productDraftController.getDraftStats);

module.exports = router; 