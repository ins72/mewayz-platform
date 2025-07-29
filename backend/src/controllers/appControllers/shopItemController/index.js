const ShopItem = require('../../../models/appModels/ShopItem');
const Creator = require('../../../models/appModels/Creator');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createShopItem = catchAsync(async (req, res, next) => {
  const shopItem = await ShopItem.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      shopItem,
    },
  });
});

exports.getAllShopItems = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    creatorId, 
    isFeatured, 
    sort = '-createdAt',
    minPrice,
    maxPrice,
    tags
  } = req.query;

  const filter = { isActive: true };
  
  if (category) filter.category = category;
  if (creatorId) filter.creatorId = creatorId;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    filter.tags = { $in: tagArray };
  }

  const shopItems = await ShopItem.find(filter)
    .populate('creatorId', 'login avatar isVerified')
    .populate('productId', 'title image price description')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await ShopItem.countDocuments(filter);

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

exports.getShopItem = catchAsync(async (req, res, next) => {
  const shopItem = await ShopItem.findById(req.params.id)
    .populate('creatorId', 'login avatar isVerified details socials')
    .populate('productId', 'title image price description');

  if (!shopItem) {
    return next(new AppError('No shop item found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shopItem,
    },
  });
});

exports.updateShopItem = catchAsync(async (req, res, next) => {
  const shopItem = await ShopItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!shopItem) {
    return next(new AppError('No shop item found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shopItem,
    },
  });
});

exports.deleteShopItem = catchAsync(async (req, res, next) => {
  const shopItem = await ShopItem.findByIdAndDelete(req.params.id);

  if (!shopItem) {
    return next(new AppError('No shop item found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getFeaturedItems = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const shopItems = await ShopItem.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .populate('creatorId', 'login avatar isVerified')
    .populate('productId', 'title image price description')
    .sort('-totalSales')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      shopItems,
    },
  });
});

exports.searchShopItems = catchAsync(async (req, res, next) => {
  const { q, category, minPrice, maxPrice, tags } = req.query;

  if (!q) {
    return next(new AppError('Search query is required', 400));
  }

  const filter = { 
    isActive: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ]
  };

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    filter.tags = { $in: tagArray };
  }

  const shopItems = await ShopItem.find(filter)
    .populate('creatorId', 'login avatar isVerified')
    .populate('productId', 'title image price description')
    .sort('-totalSales')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      shopItems,
    },
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await ShopItem.distinct('category', { isActive: true });
  
  res.status(200).json({
    status: 'success',
    data: {
      categories,
    },
  });
});

exports.getTags = catchAsync(async (req, res, next) => {
  const tags = await ShopItem.distinct('tags', { isActive: true });
  
  res.status(200).json({
    status: 'success',
    data: {
      tags,
    },
  });
}); 