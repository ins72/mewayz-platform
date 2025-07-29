const ProductShare = require('../../../models/appModels/ProductShare');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createProductShare = catchAsync(async (req, res, next) => {
  const productShare = await ProductShare.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      productShare,
    },
  });
});

exports.getAllProductShares = catchAsync(async (req, res, next) => {
  const { 
    productId, 
    sharedBy, 
    shareType, 
    platform, 
    isActive, 
    sort = '-sharedAt' 
  } = req.query;

  const filter = {};
  if (productId) filter.productId = productId;
  if (sharedBy) filter.sharedBy = sharedBy;
  if (shareType) filter.shareType = shareType;
  if (platform) filter.platform = platform;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const productShares = await ProductShare.find(filter)
    .populate('productId', 'title image category price')
    .populate('sharedBy', 'name email avatar')
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      productShares,
    },
  });
});

exports.getProductShare = catchAsync(async (req, res, next) => {
  const productShare = await ProductShare.findById(req.params.id)
    .populate('productId', 'title image category price')
    .populate('sharedBy', 'name email avatar');

  if (!productShare) {
    return next(new AppError('No product share found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productShare,
    },
  });
});

exports.updateProductShare = catchAsync(async (req, res, next) => {
  const productShare = await ProductShare.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!productShare) {
    return next(new AppError('No product share found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productShare,
    },
  });
});

exports.deleteProductShare = catchAsync(async (req, res, next) => {
  const productShare = await ProductShare.findByIdAndDelete(req.params.id);

  if (!productShare) {
    return next(new AppError('No product share found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getProductSharesByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { limit = 10 } = req.query;

  const productShares = await ProductShare.find({ 
    productId, 
    isActive: true 
  })
    .populate('sharedBy', 'name email avatar')
    .sort('-sharedAt')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      productShares,
    },
  });
});

exports.getProductShareStats = catchAsync(async (req, res, next) => {
  const { productId, period = '30d' } = req.query;

  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  const filter = { sharedAt: { $gte: startDate }, isActive: true };
  if (productId) filter.productId = productId;

  const stats = await ProductShare.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$shareType',
        totalShares: { $sum: 1 },
        totalShareCount: { $sum: '$shareCount' },
      },
    },
  ]);

  const platformStats = await ProductShare.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$platform',
        totalShares: { $sum: 1 },
        totalShareCount: { $sum: '$shareCount' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      shareTypeStats: stats,
      platformStats,
    },
  });
}); 