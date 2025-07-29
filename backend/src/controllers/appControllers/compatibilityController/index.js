const Compatibility = require('../../../models/appModels/Compatibility');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createCompatibility = catchAsync(async (req, res, next) => {
  const compatibility = await Compatibility.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      compatibility,
    },
  });
});

exports.getAllCompatibilities = catchAsync(async (req, res, next) => {
  const { category, productId, isActive, sort = 'order' } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (productId) filter.productId = productId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const compatibilities = await Compatibility.find(filter)
    .populate('productId', 'title image')
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      compatibilities,
    },
  });
});

exports.getCompatibility = catchAsync(async (req, res, next) => {
  const compatibility = await Compatibility.findById(req.params.id)
    .populate('productId', 'title image description');

  if (!compatibility) {
    return next(new AppError('No compatibility found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      compatibility,
    },
  });
});

exports.updateCompatibility = catchAsync(async (req, res, next) => {
  const compatibility = await Compatibility.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!compatibility) {
    return next(new AppError('No compatibility found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      compatibility,
    },
  });
});

exports.deleteCompatibility = catchAsync(async (req, res, next) => {
  const compatibility = await Compatibility.findByIdAndDelete(req.params.id);

  if (!compatibility) {
    return next(new AppError('No compatibility found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getActiveCompatibilities = catchAsync(async (req, res, next) => {
  const compatibilities = await Compatibility.find({ isActive: true })
    .sort('order')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      compatibilities,
    },
  });
});

exports.getCompatibilitiesByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  const compatibilities = await Compatibility.find({ 
    category, 
    isActive: true 
  })
    .sort('order')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      compatibilities,
    },
  });
});

exports.getProductCompatibilities = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const compatibilities = await Compatibility.find({ 
    productId, 
    isActive: true 
  })
    .sort('order')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      compatibilities,
    },
  });
}); 