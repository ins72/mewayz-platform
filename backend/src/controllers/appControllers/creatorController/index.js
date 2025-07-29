const Creator = require('../../../models/appModels/Creator');
const ShopItem = require('../../../models/appModels/ShopItem');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createCreator = catchAsync(async (req, res, next) => {
  const creator = await Creator.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      creator,
    },
  });
});

exports.getAllCreators = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, isOnline, isVerified, sort = '-totalSales' } = req.query;

  const filter = { isActive: true };
  if (isOnline !== undefined) filter.isOnline = isOnline === 'true';
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

  const creators = await Creator.find(filter)
    .populate('userId', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Creator.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      creators,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getCreator = catchAsync(async (req, res, next) => {
  const creator = await Creator.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('shop.productId', 'title image price');

  if (!creator) {
    return next(new AppError('No creator found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      creator,
    },
  });
});

exports.updateCreator = catchAsync(async (req, res, next) => {
  const creator = await Creator.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!creator) {
    return next(new AppError('No creator found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      creator,
    },
  });
});

exports.deleteCreator = catchAsync(async (req, res, next) => {
  const creator = await Creator.findByIdAndDelete(req.params.id);

  if (!creator) {
    return next(new AppError('No creator found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getCreatorShop = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const shopItems = await ShopItem.find({ 
    creatorId: req.params.id,
    isActive: true 
  })
    .populate('productId', 'title image price description')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await ShopItem.countDocuments({ 
    creatorId: req.params.id,
    isActive: true 
  });

  res.status(200).json({
    status: 'success',
    data: {
      shopItems,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getTopCreators = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const creators = await Creator.find({ isActive: true })
    .sort('-totalSales')
    .limit(parseInt(limit))
    .populate('userId', 'name email')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      creators,
    },
  });
});

exports.searchCreators = catchAsync(async (req, res, next) => {
  const { q, tags } = req.query;

  const filter = { isActive: true };
  
  if (q) {
    filter.$or = [
      { login: { $regex: q, $options: 'i' } },
      { details: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    filter.tags = { $in: tagArray };
  }

  const creators = await Creator.find(filter)
    .populate('userId', 'name email')
    .sort('-totalSales')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      creators,
    },
  });
}); 