const DeviceAnalytics = require('../../../models/appModels/DeviceAnalytics');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createDeviceAnalytics = catchAsync(async (req, res, next) => {
  const deviceAnalytics = await DeviceAnalytics.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      deviceAnalytics,
    },
  });
});

exports.getAllDeviceAnalytics = catchAsync(async (req, res, next) => {
  const { type, userId, productId, isActive, sort = '-createdAt' } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const deviceAnalytics = await DeviceAnalytics.find(filter)
    .populate('userId', 'name email')
    .populate('productId', 'title image')
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      deviceAnalytics,
    },
  });
});

exports.getDeviceAnalytics = catchAsync(async (req, res, next) => {
  const deviceAnalytics = await DeviceAnalytics.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('productId', 'title image');

  if (!deviceAnalytics) {
    return next(new AppError('No device analytics found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      deviceAnalytics,
    },
  });
});

exports.updateDeviceAnalytics = catchAsync(async (req, res, next) => {
  const deviceAnalytics = await DeviceAnalytics.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!deviceAnalytics) {
    return next(new AppError('No device analytics found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      deviceAnalytics,
    },
  });
});

exports.deleteDeviceAnalytics = catchAsync(async (req, res, next) => {
  const deviceAnalytics = await DeviceAnalytics.findByIdAndDelete(req.params.id);

  if (!deviceAnalytics) {
    return next(new AppError('No device analytics found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getDeviceData = catchAsync(async (req, res, next) => {
  const { userId, productId } = req.query;

  const filter = { type: 'device', isActive: true };
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;

  const deviceData = await DeviceAnalytics.find(filter)
    .sort('-value')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      deviceData,
    },
  });
});

exports.getGenderData = catchAsync(async (req, res, next) => {
  const { userId, productId } = req.query;

  const filter = { type: 'gender', isActive: true };
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;

  const genderData = await DeviceAnalytics.find(filter)
    .sort('-value')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      genderData,
    },
  });
});

exports.getDeviceAnalyticsStats = catchAsync(async (req, res, next) => {
  const { userId, productId } = req.query;

  const filter = { isActive: true };
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;

  const stats = await DeviceAnalytics.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        totalValue: { $sum: '$value' },
        count: { $sum: 1 },
        items: { $push: { name: '$name', value: '$value', icon: '$icon' } },
      },
    },
  ]);

  const deviceStats = stats.find(s => s._id === 'device') || { totalValue: 0, count: 0, items: [] };
  const genderStats = stats.find(s => s._id === 'gender') || { totalValue: 0, count: 0, items: [] };

  res.status(200).json({
    status: 'success',
    data: {
      deviceStats,
      genderStats,
    },
  });
}); 