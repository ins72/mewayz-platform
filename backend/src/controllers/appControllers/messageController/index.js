const Message = require('../../../models/appModels/Message');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ 
    $or: [
      { sender: req.user.id },
      { recipient: req.user.id }
    ]
  })
  .populate('sender', 'name avatar')
  .populate('recipient', 'name avatar')
  .sort({ timestamp: -1 });

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages,
    },
  });
});

exports.createMessage = catchAsync(async (req, res, next) => {
  const { content, recipientId, type } = req.body;

  const newMessage = await Message.create({
    sender: req.user.id,
    recipient: recipientId,
    content,
    type: type || 'text',
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: {
      message: populatedMessage,
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  if (!message) {
    return next(new AppError('No message found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.deleteConversation = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  // Delete all messages in the conversation
  await Message.deleteMany({
    $or: [
      { sender: req.user.id, recipient: conversationId },
      { sender: conversationId, recipient: req.user.id }
    ]
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
}); 