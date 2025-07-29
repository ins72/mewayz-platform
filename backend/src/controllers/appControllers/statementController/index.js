const Statement = require('../../../models/appModels/Statement');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createStatement = catchAsync(async (req, res, next) => {
  const statement = await Statement.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      statement,
    },
  });
});

exports.getAllStatements = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type, status, sort = '-date' } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const statements = await Statement.find(filter)
    .populate('productId', 'title image')
    .populate('customerId', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Statement.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      statements,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getStatement = catchAsync(async (req, res, next) => {
  const statement = await Statement.findById(req.params.id)
    .populate('productId', 'title image price')
    .populate('customerId', 'name email phone')
    .populate('userId', 'name email');

  if (!statement) {
    return next(new AppError('No statement found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      statement,
    },
  });
});

exports.updateStatement = catchAsync(async (req, res, next) => {
  const statement = await Statement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!statement) {
    return next(new AppError('No statement found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      statement,
    },
  });
});

exports.deleteStatement = catchAsync(async (req, res, next) => {
  const statement = await Statement.findByIdAndDelete(req.params.id);

  if (!statement) {
    return next(new AppError('No statement found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getStatementStats = catchAsync(async (req, res, next) => {
  const stats = await Statement.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalPrice: { $sum: '$price' },
      },
    },
  ]);

  const totalStatements = await Statement.countDocuments();
  const totalAmount = await Statement.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const myFunds = await Statement.aggregate([
    { $match: { type: 'paid', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const earnings = await Statement.aggregate([
    { $match: { type: 'paid' } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);

  const fees = await Statement.aggregate([
    { $match: { type: 'paid' } },
    { $group: { _id: null, total: { $sum: { $subtract: ['$price', '$amount'] } } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      totalStatements,
      totalAmount: totalAmount[0]?.total || 0,
      myFunds: myFunds[0]?.total || 0,
      earnings: earnings[0]?.total || 0,
      fees: fees[0]?.total || 0,
    },
  });
}); 