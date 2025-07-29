const Transaction = require('../../../models/appModels/Transaction');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const { type, status, startDate, endDate, limit = 10, page = 1 } = req.query;
  
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter)
    .populate('userId', 'name email')
    .populate('productId', 'title image')
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Transaction.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    total,
    data: {
      transactions,
    },
  });
});

exports.getTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('productId', 'title image');

  if (!transaction) {
    return next(new AppError('No transaction found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transaction,
    },
  });
});

exports.createTransaction = catchAsync(async (req, res, next) => {
  const transactionData = {
    ...req.body,
    userId: req.user.id,
  };

  const newTransaction = await Transaction.create(transactionData);

  const populatedTransaction = await Transaction.findById(newTransaction._id)
    .populate('userId', 'name email')
    .populate('productId', 'title image');

  res.status(201).json({
    status: 'success',
    data: {
      transaction: populatedTransaction,
    },
  });
});

exports.updateTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('userId', 'name email')
   .populate('productId', 'title image');

  if (!transaction) {
    return next(new AppError('No transaction found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transaction,
    },
  });
});

exports.deleteTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);

  if (!transaction) {
    return next(new AppError('No transaction found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTransactionStats = catchAsync(async (req, res, next) => {
  const { period = 'monthly', startDate, endDate } = req.query;
  
  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const stats = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' },
      },
    },
  ]);

  const typeStats = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const statusStats = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: stats[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
      },
      byType: typeStats,
      byStatus: statusStats,
    },
  });
}); 