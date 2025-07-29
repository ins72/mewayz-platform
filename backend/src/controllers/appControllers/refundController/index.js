const Refund = require('../../../models/appModels/Refund');
const Client = require('../../../models/appModels/Client');
const Product = require('../../../models/appModels/Product');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createRefund = catchAsync(async (req, res, next) => {
  const refund = await Refund.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      refund,
    },
  });
});

exports.getAllRefunds = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const refunds = await Refund.find(filter)
    .populate('customerId', 'name avatar')
    .populate('productId', 'title image')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Refund.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      refunds,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getRefund = catchAsync(async (req, res, next) => {
  const refund = await Refund.findById(req.params.id)
    .populate('customerId', 'name avatar email')
    .populate('productId', 'title image price')
    .populate('processedBy', 'name');

  if (!refund) {
    return next(new AppError('No refund found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      refund,
    },
  });
});

exports.updateRefund = catchAsync(async (req, res, next) => {
  const refund = await Refund.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!refund) {
    return next(new AppError('No refund found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      refund,
    },
  });
});

exports.deleteRefund = catchAsync(async (req, res, next) => {
  const refund = await Refund.findByIdAndDelete(req.params.id);

  if (!refund) {
    return next(new AppError('No refund found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getRefundStats = catchAsync(async (req, res, next) => {
  const stats = await Refund.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$price' },
      },
    },
  ]);

  const totalRefunds = await Refund.countDocuments();
  const totalAmount = await Refund.aggregate([
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      totalRefunds,
      totalAmount: totalAmount[0]?.total || 0,
    },
  });
}); 