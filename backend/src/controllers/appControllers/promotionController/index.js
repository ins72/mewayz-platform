const Promotion = require('../../../models/appModels/Promotion');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

// Configure multer for file uploads
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPromotionImage = upload.single('image');

exports.resizePromotionImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `promotion-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(800, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/promotions/${req.file.filename}`);

  next();
});

exports.createPromotion = catchAsync(async (req, res, next) => {
  const { content, type } = req.body;
  const creatorId = req.user.id;

  const promotionData = {
    title: content.substring(0, 100), // Use first 100 chars as title
    content,
    type: type || 'announcement',
    creatorId,
    status: 'draft',
  };

  if (req.file) {
    promotionData.image = req.file.filename;
  }

  const newPromotion = await Promotion.create(promotionData);

  res.status(201).json({
    status: 'success',
    data: {
      promotion: newPromotion,
    },
  });
});

exports.updatePromotion = catchAsync(async (req, res, next) => {
  const { promotionId } = req.params;
  const updateData = req.body;

  const promotion = await Promotion.findByIdAndUpdate(
    promotionId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!promotion) {
    return next(new AppError('No promotion found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      promotion,
    },
  });
});

exports.deletePromotion = catchAsync(async (req, res, next) => {
  const { promotionId } = req.params;

  const promotion = await Promotion.findByIdAndDelete(promotionId);

  if (!promotion) {
    return next(new AppError('No promotion found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.schedulePromotion = catchAsync(async (req, res, next) => {
  const { promotionId } = req.params;
  const { scheduleDate } = req.body;

  const promotion = await Promotion.findByIdAndUpdate(
    promotionId,
    {
      status: 'scheduled',
      startDate: scheduleDate,
    },
    { new: true }
  );

  if (!promotion) {
    return next(new AppError('No promotion found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      promotion,
    },
  });
});

exports.publishPromotion = catchAsync(async (req, res, next) => {
  const { promotionId } = req.params;

  const promotion = await Promotion.findByIdAndUpdate(
    promotionId,
    {
      status: 'published',
      startDate: new Date(),
    },
    { new: true }
  );

  if (!promotion) {
    return next(new AppError('No promotion found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      promotion,
    },
  });
});

exports.getAllPromotions = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    type, 
    creatorId, 
    sort = '-createdAt' 
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (creatorId) filter.creatorId = creatorId;

  const promotions = await Promotion.find(filter)
    .populate('creatorId', 'login avatar')
    .populate('productId', 'title image price')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Promotion.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      promotions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getPromotion = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id)
    .populate('creatorId', 'login avatar details')
    .populate('productId', 'title image price description');

  if (!promotion) {
    return next(new AppError('No promotion found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      promotion,
    },
  });
});

exports.updatePromotionStats = catchAsync(async (req, res, next) => {
  const { likes, views, conversationRate } = req.body;
  
  const promotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    { 
      likes, 
      views, 
      conversationRate 
    },
    { new: true, runValidators: true }
  );

  if (!promotion) {
    return next(new AppError('No promotion found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      promotion,
    },
  });
});

exports.getPromotionInsights = catchAsync(async (req, res, next) => {
  const { creatorId } = req.params;
  const { period = '30d' } = req.query;

  const promotions = await Promotion.find({ 
    creatorId, 
    status: 'published',
    isActive: true 
  });

  const totalViews = promotions.reduce((sum, p) => sum + p.views.counter, 0);
  const totalLikes = promotions.reduce((sum, p) => sum + p.likes.counter, 0);
  const avgConversationRate = promotions.length > 0 
    ? promotions.reduce((sum, p) => sum + p.conversationRate, 0) / promotions.length 
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      totalViews,
      totalLikes,
      avgConversationRate,
      totalPromotions: promotions.length,
    },
  });
}); 