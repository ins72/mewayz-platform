const Comment = require('../../../models/appModels/Comment');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.getAllComments = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1, productId, userId } = req.query;
  
  const filter = {};
  if (productId) filter.productId = productId;
  if (userId) filter.userId = userId;

  const comments = await Comment.find(filter)
    .populate('userId', 'name email avatar')
    .populate('productId', 'title image category')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Comment.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: comments.length,
    total,
    data: {
      comments,
    },
  });
});

exports.getComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)
    .populate('userId', 'name email avatar')
    .populate('productId', 'title image category');

  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const { content, productId, parentId } = req.body;
  const userId = req.user.id;

  const commentData = {
    content,
    userId,
    productId,
  };

  if (parentId) {
    commentData.parentId = parentId;
  }

  const newComment = await Comment.create(commentData);

  const populatedComment = await Comment.findById(newComment._id)
    .populate('userId', 'name email avatar')
    .populate('productId', 'title image category');

  res.status(201).json({
    status: 'success',
    data: {
      comment: populatedComment,
    },
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const commentId = req.params.id;
  const userId = req.user.id;

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, userId },
    { content },
    { new: true, runValidators: true }
  ).populate('userId', 'name email avatar')
   .populate('productId', 'title image category');

  if (!comment) {
    return next(new AppError('No comment found with that ID or not authorized', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  const comment = await Comment.findOneAndDelete({ _id: commentId, userId });

  if (!comment) {
    return next(new AppError('No comment found with that ID or not authorized', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.markComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;
  const { isMarked } = req.body;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { isMarked },
    { new: true }
  );

  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

exports.getReplies = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { limit = 10, page = 1 } = req.query;

  const replies = await Comment.find({ parentId: commentId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: 1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Comment.countDocuments({ parentId: commentId });

  res.status(200).json({
    status: 'success',
    results: replies.length,
    total,
    data: {
      replies,
    },
  });
}); 