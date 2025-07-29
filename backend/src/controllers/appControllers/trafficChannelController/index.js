const TrafficChannel = require('../../../models/appModels/TrafficChannel');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createTrafficChannel = catchAsync(async (req, res, next) => {
  const trafficChannel = await TrafficChannel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      trafficChannel,
    },
  });
});

exports.getAllTrafficChannels = catchAsync(async (req, res, next) => {
  const { userId, productId, period, startDate, endDate, isActive, sort = '-date' } = req.query;

  const filter = {};
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;
  if (period) filter.period = period;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const trafficChannels = await TrafficChannel.find(filter)
    .populate('userId', 'name email')
    .populate('productId', 'title image')
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      trafficChannels,
    },
  });
});

exports.getTrafficChannel = catchAsync(async (req, res, next) => {
  const trafficChannel = await TrafficChannel.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('productId', 'title image');

  if (!trafficChannel) {
    return next(new AppError('No traffic channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      trafficChannel,
    },
  });
});

exports.updateTrafficChannel = catchAsync(async (req, res, next) => {
  const trafficChannel = await TrafficChannel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!trafficChannel) {
    return next(new AppError('No traffic channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      trafficChannel,
    },
  });
});

exports.deleteTrafficChannel = catchAsync(async (req, res, next) => {
  const trafficChannel = await TrafficChannel.findByIdAndDelete(req.params.id);

  if (!trafficChannel) {
    return next(new AppError('No traffic channel found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTrafficChannelStats = catchAsync(async (req, res, next) => {
  const { userId, productId, period = '7d' } = req.query;

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
      startDate.setDate(startDate.getDate() - 7);
  }

  const filter = { date: { $gte: startDate }, isActive: true };
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;

  const stats = await TrafficChannel.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalDirect: { $sum: '$direct' },
        totalSearch: { $sum: '$search' },
        totalSocial: { $sum: '$social' },
        totalReferral: { $sum: '$referral' },
        totalEmail: { $sum: '$email' },
        totalOther: { $sum: '$other' },
        totalTraffic: { $sum: { $add: ['$direct', '$search', '$social', '$referral', '$email', '$other'] } },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalDirect: 0,
        totalSearch: 0,
        totalSocial: 0,
        totalReferral: 0,
        totalEmail: 0,
        totalOther: 0,
        totalTraffic: 0,
      },
    },
  });
});

exports.getTrafficChannelData = catchAsync(async (req, res, next) => {
  const { userId, productId, period = '7d' } = req.query;

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
      startDate.setDate(startDate.getDate() - 7);
  }

  const filter = { date: { $gte: startDate }, isActive: true };
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;

  const trafficData = await TrafficChannel.find(filter)
    .sort('date')
    .exec();

  const formattedData = trafficData.map(item => ({
    name: item.date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),
    direct: item.direct,
    search: item.search,
    other: item.social + item.referral + item.email + item.other,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      trafficData: formattedData,
    },
  });
}); 