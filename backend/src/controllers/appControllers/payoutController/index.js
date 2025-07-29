const Payout = require('../../../models/appModels/Payout');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createPayout = catchAsync(async (req, res, next) => {
  const payout = await Payout.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      payout,
    },
  });
});

exports.getAllPayouts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, method, sort = '-date' } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (method) filter.method = method;

  const payouts = await Payout.find(filter)
    .populate('userId', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Payout.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      payouts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getPayout = catchAsync(async (req, res, next) => {
  const payout = await Payout.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('processedBy', 'name');

  if (!payout) {
    return next(new AppError('No payout found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payout,
    },
  });
});

exports.updatePayout = catchAsync(async (req, res, next) => {
  const payout = await Payout.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!payout) {
    return next(new AppError('No payout found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payout,
    },
  });
});

exports.deletePayout = catchAsync(async (req, res, next) => {
  const payout = await Payout.findByIdAndDelete(req.params.id);

  if (!payout) {
    return next(new AppError('No payout found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getPayoutStats = catchAsync(async (req, res, next) => {
  const stats = await Payout.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalNet: { $sum: '$net' },
      },
    },
  ]);

  const totalPayouts = await Payout.countDocuments();
  const totalAmount = await Payout.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const currentBalance = await Payout.aggregate([
    { $match: { status: { $in: ['in progress', 'paid'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      totalPayouts,
      totalAmount: totalAmount[0]?.total || 0,
      currentBalance: currentBalance[0]?.total || 0,
    },
  });
}); 