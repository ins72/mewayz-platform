const Income = require('../../../models/appModels/Income');
const Transaction = require('../../../models/appModels/Transaction');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createIncome = catchAsync(async (req, res, next) => {
  const income = await Income.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      income,
    },
  });
});

exports.getAllIncome = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type, period, sort = '-createdAt' } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (period) filter.period = period;

  const income = await Income.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Income.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      income,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getIncome = catchAsync(async (req, res, next) => {
  const income = await Income.findById(req.params.id);

  if (!income) {
    return next(new AppError('No income record found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      income,
    },
  });
});

exports.updateIncome = catchAsync(async (req, res, next) => {
  const income = await Income.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!income) {
    return next(new AppError('No income record found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      income,
    },
  });
});

exports.deleteIncome = catchAsync(async (req, res, next) => {
  const income = await Income.findByIdAndDelete(req.params.id);

  if (!income) {
    return next(new AppError('No income record found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getIncomeStats = catchAsync(async (req, res, next) => {
  const { period = 'monthly' } = req.query;

  // Get total earnings from transactions
  const totalEarnings = await Transaction.aggregate([
    { $match: { type: 'income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Get monthly earnings trend
  const monthlyEarnings = await Transaction.aggregate([
    { $match: { type: 'income' } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  // Get balance earnings data
  const balanceEarnings = await Income.find({ type: 'balance' })
    .sort('createdAt')
    .limit(2);

  res.status(200).json({
    status: 'success',
    data: {
      totalEarnings: totalEarnings[0]?.total || 0,
      monthlyEarnings: monthlyEarnings.map(item => ({
        name: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        amt: item.total,
      })),
      balanceEarnings,
    },
  });
}); 