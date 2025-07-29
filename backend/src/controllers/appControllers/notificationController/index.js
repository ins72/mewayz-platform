const Notification = require('../../../models/appModels/Notification');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.getAllNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ timestamp: -1 });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications,
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
});

exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
}); 