const Follower = require('../../../models/appModels/Follower');
const User = require('../../../models/appModels/User');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.follow = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  // Check if user exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    return next(new AppError('User not found', 404));
  }

  // Check if already following
  const existingFollow = await Follower.findOne({
    followerId,
    followingId: userId,
  });

  if (existingFollow) {
    return next(new AppError('Already following this user', 400));
  }

  // Create follow relationship
  const newFollow = await Follower.create({
    followerId,
    followingId: userId,
  });

  const populatedFollow = await Follower.findById(newFollow._id)
    .populate('followerId', 'name email avatar')
    .populate('followingId', 'name email avatar');

  res.status(201).json({
    status: 'success',
    data: {
      follow: populatedFollow,
    },
  });
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  const follow = await Follower.findOneAndDelete({
    followerId,
    followingId: userId,
  });

  if (!follow) {
    return next(new AppError('Not following this user', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getFollowers = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user.id;

  const followers = await Follower.find({ followingId: targetUserId })
    .populate('followerId', 'name email avatar position totalProducts rating')
    .sort({ followedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: followers.length,
    data: {
      followers,
    },
  });
});

exports.getFollowing = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user.id;

  const following = await Follower.find({ followerId: targetUserId })
    .populate('followingId', 'name email avatar')
    .sort({ followedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: following.length,
    data: {
      following,
    },
  });
});

exports.checkFollowStatus = catchAsync(async (req, res, next) => {
  const { followingId } = req.params;
  const followerId = req.user.id;

  const follower = await Follower.findOne({ followerId, followingId, isActive: true });

  res.status(200).json({
    status: 'success',
    data: {
      isFollowing: !!follower,
    },
  });
});

exports.getFollowersCount = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const followersCount = await Follower.countDocuments({ followingId: userId, isActive: true });
  const followingCount = await Follower.countDocuments({ followerId: userId, isActive: true });

  res.status(200).json({
    status: 'success',
    data: {
      followersCount,
      followingCount,
    },
  });
}); 