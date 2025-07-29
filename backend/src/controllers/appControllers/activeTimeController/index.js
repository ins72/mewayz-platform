const ActiveTime = require('../../../models/appModels/ActiveTime');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.getUserActiveTimes = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user.id;

  const activeTimes = await ActiveTime.find({ userId: targetUserId })
    .sort({ date: -1 });

  // Group by time slots and days
  const timeSlots = [];
  const timeSlotMap = {};

  activeTimes.forEach(activeTime => {
    if (!timeSlotMap[activeTime.timeSlot]) {
      timeSlotMap[activeTime.timeSlot] = {
        id: timeSlots.length + 1,
        time: activeTime.timeSlot,
        days: { Mo: 0, Tu: 0, We: 0, Th: 0, Fr: 0, Sa: 0, Su: 0 }
      };
      timeSlots.push(timeSlotMap[activeTime.timeSlot]);
    }
    
    timeSlotMap[activeTime.timeSlot].days[activeTime.dayOfWeek] = activeTime.activityCount;
  });

  res.status(200).json({
    status: 'success',
    results: timeSlots.length,
    data: {
      timeSlots,
    },
  });
});

exports.createActiveTime = catchAsync(async (req, res, next) => {
  const { timeSlot, dayOfWeek, activityCount, sessionDuration, pageViews, actions } = req.body;
  const userId = req.user.id;

  const activeTime = await ActiveTime.create({
    userId,
    timeSlot,
    dayOfWeek,
    activityCount,
    sessionDuration,
    pageViews,
    actions,
  });

  res.status(201).json({
    status: 'success',
    data: {
      activeTime,
    },
  });
});

exports.updateActiveTime = catchAsync(async (req, res, next) => {
  const activeTime = await ActiveTime.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!activeTime) {
    return next(new AppError('No active time found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      activeTime,
    },
  });
});

exports.deleteActiveTime = catchAsync(async (req, res, next) => {
  const activeTime = await ActiveTime.findByIdAndDelete(req.params.id);

  if (!activeTime) {
    return next(new AppError('No active time found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getActiveTimeStats = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user.id;

  const stats = await ActiveTime.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(targetUserId) } },
    {
      $group: {
        _id: '$dayOfWeek',
        totalActivity: { $sum: '$activityCount' },
        totalSessions: { $sum: 1 },
        avgSessionDuration: { $avg: '$sessionDuration' },
        totalPageViews: { $sum: '$pageViews' },
        totalActions: { $sum: '$actions' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
}); 