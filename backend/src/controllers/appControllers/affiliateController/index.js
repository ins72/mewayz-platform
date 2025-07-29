const Affiliate = require('../../../models/appModels/Affiliate');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createAffiliate = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      affiliate,
    },
  });
});

exports.getAllAffiliates = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    isVerified, 
    sort = '-totalEarnings' 
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

  const affiliates = await Affiliate.find(filter)
    .populate('userId', 'name email avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Affiliate.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      affiliates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    },
  });
});

exports.getAffiliate = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findById(req.params.id)
    .populate('userId', 'name email avatar')
    .populate('performance.topProducts.productId', 'title image price');

  if (!affiliate) {
    return next(new AppError('No affiliate found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      affiliate,
    },
  });
});

exports.updateAffiliate = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!affiliate) {
    return next(new AppError('No affiliate found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      affiliate,
    },
  });
});

exports.deleteAffiliate = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findByIdAndDelete(req.params.id);

  if (!affiliate) {
    return next(new AppError('No affiliate found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAffiliateByCode = catchAsync(async (req, res, next) => {
  const { code } = req.params;

  const affiliate = await Affiliate.findOne({ 
    affiliateCode: code, 
    status: 'active' 
  })
    .populate('userId', 'name email avatar');

  if (!affiliate) {
    return next(new AppError('No affiliate found with that code', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      affiliate,
    },
  });
});

exports.getAffiliateInsights = catchAsync(async (req, res, next) => {
  const { affiliateId } = req.params;
  const { period = '30d' } = req.query;

  const affiliate = await Affiliate.findById(affiliateId);
  if (!affiliate) {
    return next(new AppError('No affiliate found with that ID', 404));
  }

  // Calculate insights based on performance data
  const insights = [
    {
      id: 1,
      title: "Product views",
      value: affiliate.totalReferrals.toString(),
      icon: "product-think",
      percentage: 36.8,
      tooltip: "Maximum 100 characters. No HTML or emoji allowed",
      dataChart: affiliate.performance.monthlyEarnings.map(earning => ({
        name: earning.month,
        amt: earning.amount,
      })),
    },
    {
      id: 2,
      title: "Orders",
      value: affiliate.totalSales.toString(),
      icon: "bag",
      percentage: -24.2,
      tooltip: "Maximum 100 characters. No HTML or emoji allowed",
      dataChart: affiliate.performance.monthlyEarnings.map(earning => ({
        name: earning.month,
        amt: earning.amount * 0.7, // Simulate order data
      })),
    },
    {
      id: 3,
      title: "Earning",
      value: `${(affiliate.totalEarnings / 1000).toFixed(0)}k`,
      icon: "chart",
      percentage: 16.9,
      tooltip: "Maximum 100 characters. No HTML or emoji allowed",
      dataChart: affiliate.performance.monthlyEarnings.map(earning => ({
        name: earning.month,
        amt: earning.amount,
      })),
    },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      insights,
    },
  });
});

exports.getTopAffiliates = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const affiliates = await Affiliate.find({ 
    status: 'active',
    isVerified: true 
  })
    .populate('userId', 'name email avatar')
    .sort('-totalEarnings')
    .limit(parseInt(limit))
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      affiliates,
    },
  });
});

exports.updateAffiliateEarnings = catchAsync(async (req, res, next) => {
  const { amount, productId } = req.body;
  
  const affiliate = await Affiliate.findByIdAndUpdate(
    req.params.id,
    {
      $inc: { 
        totalEarnings: amount,
        totalSales: 1,
      },
      $push: {
        'performance.topProducts': {
          productId,
          sales: 1,
          earnings: amount,
        },
      },
    },
    { new: true, runValidators: true }
  );

  if (!affiliate) {
    return next(new AppError('No affiliate found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      affiliate,
    },
  });
}); 