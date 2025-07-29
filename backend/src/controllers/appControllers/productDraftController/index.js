const ProductDraft = require('../../../models/appModels/ProductDraft');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createProductDraft = catchAsync(async (req, res, next) => {
  const productDraft = await ProductDraft.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      productDraft,
    },
  });
});

exports.getAllProductDrafts = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    creatorId, 
    userId, 
    category, 
    sort = '-createdAt' 
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (creatorId) filter.creatorId = creatorId;
  if (userId) filter.userId = userId;
  if (category) filter.category = category;

  const productDrafts = await ProductDraft.find(filter)
    .populate('creatorId', 'login avatar')
    .populate('userId', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await ProductDraft.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      productDrafts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getProductDraft = catchAsync(async (req, res, next) => {
  const productDraft = await ProductDraft.findById(req.params.id)
    .populate('creatorId', 'login avatar details')
    .populate('userId', 'name email');

  if (!productDraft) {
    return next(new AppError('No product draft found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productDraft,
    },
  });
});

exports.updateProductDraft = catchAsync(async (req, res, next) => {
  const productDraft = await ProductDraft.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!productDraft) {
    return next(new AppError('No product draft found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productDraft,
    },
  });
});

exports.deleteProductDraft = catchAsync(async (req, res, next) => {
  const productDraft = await ProductDraft.findByIdAndDelete(req.params.id);

  if (!productDraft) {
    return next(new AppError('No product draft found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getDraftsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { status, limit = 10 } = req.query;

  const filter = { userId };
  if (status) filter.status = status;

  const drafts = await ProductDraft.find(filter)
    .populate('creatorId', 'login avatar')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      drafts,
    },
  });
});

exports.getDraftsByCreator = catchAsync(async (req, res, next) => {
  const { creatorId } = req.params;
  const { status, limit = 10 } = req.query;

  const filter = { creatorId };
  if (status) filter.status = status;

  const drafts = await ProductDraft.find(filter)
    .populate('userId', 'name email')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      drafts,
    },
  });
});

exports.updateDraftStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  const productDraft = await ProductDraft.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!productDraft) {
    return next(new AppError('No product draft found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productDraft,
    },
  });
});

exports.getDraftStats = catchAsync(async (req, res, next) => {
  const { userId, creatorId } = req.query;

  const filter = {};
  if (userId) filter.userId = userId;
  if (creatorId) filter.creatorId = creatorId;

  const stats = await ProductDraft.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalDrafts = await ProductDraft.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      totalDrafts,
    },
  });
}); 