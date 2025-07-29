const FAQ = require('../../../models/appModels/FAQ');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      faq,
    },
  });
});

exports.getAllFAQs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, isActive, sort = 'order' } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const faqs = await FAQ.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await FAQ.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      faqs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      faq,
    },
  });
});

exports.updateFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      faq,
    },
  });
});

exports.deleteFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);

  if (!faq) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getActiveFAQs = catchAsync(async (req, res, next) => {
  const faqs = await FAQ.find({ isActive: true })
    .sort('order')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      faqs,
    },
  });
});

exports.searchFAQs = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError('Search query is required', 400));
  }

  const faqs = await FAQ.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { 'items.title': { $regex: q, $options: 'i' } },
      { 'items.content': { $regex: q, $options: 'i' } },
    ],
  }).sort('order');

  res.status(200).json({
    status: 'success',
    data: {
      faqs,
    },
  });
}); 