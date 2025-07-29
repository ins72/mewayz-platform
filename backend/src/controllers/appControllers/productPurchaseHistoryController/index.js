const ProductPurchaseHistory = require('../../../models/appModels/ProductPurchaseHistory');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createProductPurchaseHistory = catchAsync(async (req, res, next) => {
  const productPurchaseHistory = await ProductPurchaseHistory.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      productPurchaseHistory,
    },
  });
});

exports.getAllProductPurchaseHistory = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    productId, 
    customerId, 
    status, 
    sort = '-purchaseTime' 
  } = req.query;

  const filter = {};
  if (productId) filter.productId = productId;
  if (customerId) filter.customerId = customerId;
  if (status) filter.status = status;

  const productPurchaseHistory = await ProductPurchaseHistory.find(filter)
    .populate('productId', 'title image category')
    .populate('customerId', 'name email avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await ProductPurchaseHistory.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      productPurchaseHistory,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getProductPurchaseHistory = catchAsync(async (req, res, next) => {
  const productPurchaseHistory = await ProductPurchaseHistory.findById(req.params.id)
    .populate('productId', 'title image category')
    .populate('customerId', 'name email avatar');

  if (!productPurchaseHistory) {
    return next(new AppError('No product purchase history found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productPurchaseHistory,
    },
  });
});

exports.updateProductPurchaseHistory = catchAsync(async (req, res, next) => {
  const productPurchaseHistory = await ProductPurchaseHistory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!productPurchaseHistory) {
    return next(new AppError('No product purchase history found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productPurchaseHistory,
    },
  });
});

exports.deleteProductPurchaseHistory = catchAsync(async (req, res, next) => {
  const productPurchaseHistory = await ProductPurchaseHistory.findByIdAndDelete(req.params.id);

  if (!productPurchaseHistory) {
    return next(new AppError('No product purchase history found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getPurchaseHistoryByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { limit = 10 } = req.query;

  const purchaseHistory = await ProductPurchaseHistory.find({ 
    productId, 
    isActive: true 
  })
    .populate('customerId', 'name email avatar')
    .sort('-purchaseTime')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      purchaseHistory,
    },
  });
});

exports.getPurchaseHistoryByCustomer = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  const { limit = 10 } = req.query;

  const purchaseHistory = await ProductPurchaseHistory.find({ 
    customerId, 
    isActive: true 
  })
    .populate('productId', 'title image category')
    .sort('-purchaseTime')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      purchaseHistory,
    },
  });
});

exports.getPurchaseHistoryStats = catchAsync(async (req, res, next) => {
  const { productId, customerId, period = '30d' } = req.query;

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

  const filter = { purchaseTime: { $gte: startDate }, isActive: true };
  if (productId) filter.productId = productId;
  if (customerId) filter.customerId = customerId;

  const stats = await ProductPurchaseHistory.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        totalSales: { $sum: '$sales' },
        avgSales: { $avg: '$sales' },
      },
    },
  ]);

  const statusStats = await ProductPurchaseHistory.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSales: { $sum: '$sales' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalPurchases: 0,
        totalSales: 0,
        avgSales: 0,
      },
      statusStats,
    },
  });
}); 