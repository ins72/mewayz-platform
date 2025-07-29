const Country = require('../../../models/appModels/Country');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createCountry = catchAsync(async (req, res, next) => {
  const country = await Country.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      country,
    },
  });
});

exports.getAllCountries = catchAsync(async (req, res, next) => {
  const { isActive, sort = 'name' } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const countries = await Country.find(filter)
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      countries,
    },
  });
});

exports.getCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findById(req.params.id);

  if (!country) {
    return next(new AppError('No country found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      country,
    },
  });
});

exports.updateCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!country) {
    return next(new AppError('No country found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      country,
    },
  });
});

exports.deleteCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findByIdAndDelete(req.params.id);

  if (!country) {
    return next(new AppError('No country found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getCountriesAnalytics = catchAsync(async (req, res, next) => {
  const countries = await Country.find({ isActive: true })
    .sort('-percentage')
    .limit(10)
    .exec();

  const totalSales = await Country.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$totalSales' } } },
  ]);

  const totalCustomers = await Country.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$totalCustomers' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      countries,
      totalSales: totalSales[0]?.total || 0,
      totalCustomers: totalCustomers[0]?.total || 0,
    },
  });
});

exports.getCountriesEarnings = catchAsync(async (req, res, next) => {
  const countries = await Country.find({ isActive: true })
    .sort('-price')
    .limit(10)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      countries,
    },
  });
}); 