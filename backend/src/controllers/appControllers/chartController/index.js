const Chart = require('../../../models/appModels/Chart');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createChart = catchAsync(async (req, res, next) => {
  const chart = await Chart.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      chart,
    },
  });
});

exports.getAllCharts = catchAsync(async (req, res, next) => {
  const { type, period, isActive, isPublic, userId } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (period) filter.period = period;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
  if (userId) filter.userId = userId;

  const charts = await Chart.find(filter)
    .populate('userId', 'name email')
    .sort('-createdAt')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      charts,
    },
  });
});

exports.getChart = catchAsync(async (req, res, next) => {
  const chart = await Chart.findById(req.params.id)
    .populate('userId', 'name email');

  if (!chart) {
    return next(new AppError('No chart found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chart,
    },
  });
});

exports.updateChart = catchAsync(async (req, res, next) => {
  const chart = await Chart.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!chart) {
    return next(new AppError('No chart found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chart,
    },
  });
});

exports.deleteChart = catchAsync(async (req, res, next) => {
  const chart = await Chart.findByIdAndDelete(req.params.id);

  if (!chart) {
    return next(new AppError('No chart found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getChartByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { period = 'monthly' } = req.query;

  const chart = await Chart.findOne({
    type,
    period,
    isActive: true,
    $or: [
      { isPublic: true },
      { userId: req.user?.id },
    ],
  }).populate('userId', 'name email');

  if (!chart) {
    return next(new AppError('No chart found for this type and period', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chart,
    },
  });
});

exports.getPublicCharts = catchAsync(async (req, res, next) => {
  const charts = await Chart.find({
    isPublic: true,
    isActive: true,
  })
    .populate('userId', 'name email')
    .sort('-createdAt')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      charts,
    },
  });
});

exports.updateChartData = catchAsync(async (req, res, next) => {
  const { data } = req.body;
  
  const chart = await Chart.findByIdAndUpdate(
    req.params.id,
    { data },
    { new: true, runValidators: true }
  );

  if (!chart) {
    return next(new AppError('No chart found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chart,
    },
  });
}); 