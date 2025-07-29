const ProductViewer = require('../../../models/appModels/ProductViewer');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createProductViewer = catchAsync(async (req, res, next) => {
  const productViewer = await ProductViewer.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      productViewer,
    },
  });
});

exports.getAllProductViewers = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    productId, 
    userId, 
    isActive, 
    sort = '-visitTime' 
  } = req.query;

  const filter = {};
  if (productId) filter.productId = productId;
  if (userId) filter.userId = userId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const productViewers = await ProductViewer.find(filter)
    .populate('productId', 'title image')
    .populate('userId', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await ProductViewer.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      productViewers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getProductViewer = catchAsync(async (req, res, next) => {
  const productViewer = await ProductViewer.findById(req.params.id)
    .populate('productId', 'title image')
    .populate('userId', 'name email');

  if (!productViewer) {
    return next(new AppError('No product viewer found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productViewer,
    },
  });
});

exports.updateProductViewer = catchAsync(async (req, res, next) => {
  const productViewer = await ProductViewer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!productViewer) {
    return next(new AppError('No product viewer found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productViewer,
    },
  });
});

exports.deleteProductViewer = catchAsync(async (req, res, next) => {
  const productViewer = await ProductViewer.findByIdAndDelete(req.params.id);

  if (!productViewer) {
    return next(new AppError('No product viewer found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getProductViewersByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { limit = 10 } = req.query;

  const productViewers = await ProductViewer.find({ 
    productId, 
    isActive: true 
  })
    .populate('userId', 'name email avatar')
    .sort('-visitTime')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      productViewers,
    },
  });
});

exports.getProductViewerStats = catchAsync(async (req, res, next) => {
  const { productId, userId, period = '30d' } = req.query;

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

  const filter = { visitTime: { $gte: startDate }, isActive: true };
  if (productId) filter.productId = productId;
  if (userId) filter.userId = userId;

  const stats = await ProductViewer.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalViewers: { $sum: 1 },
        totalPageViews: { $sum: '$pageViews' },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' },
        uniqueViewers: { $addToSet: '$userId' },
      },
    },
  ]);

  const deviceStats = await ProductViewer.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$device',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const browserStats = await ProductViewer.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$browser',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalViewers: 0,
        totalPageViews: 0,
        totalDuration: 0,
        avgDuration: 0,
        uniqueViewers: [],
      },
      deviceStats,
      browserStats,
    },
  });
}); 