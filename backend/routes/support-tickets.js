const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const auth = require('../middleware/auth');
const { requireMFA } = require('../middleware/mfa');

/**
 * @route   GET /api/v1/support-tickets
 * @desc    Get all support tickets with filters
 * @access  Private
 */
router.get('/', auth.protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { organizationId: req.user.organizationId };
    
    // Add filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.assignee) {
      filter.assignee = req.query.assignee;
    }
    if (req.query.requester) {
      filter.requester = req.query.requester;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') };
    }
    if (req.query.overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $nin: ['resolved', 'closed'] };
    }
    if (req.query.slaBreached === 'true') {
      filter['sla.breached'] = true;
    }

    const sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'oldest':
          sort.createdAt = 1;
          break;
        case 'priority':
          sort.priority = -1;
          break;
        case 'dueDate':
          sort.dueDate = 1;
          break;
        case 'lastActivity':
          sort['activities.timestamp'] = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const tickets = await SupportTicket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('requester', 'firstName lastName email avatar')
      .populate('assignee', 'firstName lastName email avatar')
      .populate('organizationId', 'name logoUrl');

    const total = await SupportTicket.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/support-tickets/stats
 * @desc    Get support ticket statistics
 * @access  Private
 */
router.get('/stats', auth.protect, async (req, res) => {
  try {
    const stats = await SupportTicket.getStats(req.user.organizationId);
    
    // Get additional stats
    const overdueTickets = await SupportTicket.findOverdue(req.user.organizationId);
    const slaBreachedTickets = await SupportTicket.findSLABreached(req.user.organizationId);
    
    const response = {
      ...stats[0],
      overdue: overdueTickets.length,
      slaBreached: slaBreachedTickets.length
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/support-tickets/:id
 * @desc    Get ticket by ID
 * @access  Private
 */
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('requester', 'firstName lastName email avatar')
      .populate('assignee', 'firstName lastName email avatar')
      .populate('organizationId', 'name logoUrl')
      .populate('relatedTickets', 'ticketNumber subject status priority')
      .populate('knowledgeBaseArticles', 'title slug excerpt');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/support-tickets
 * @desc    Create new support ticket
 * @access  Private
 */
router.post('/', auth.protect, async (req, res) => {
  try {
    const {
      subject,
      description,
      priority,
      category,
      subcategory,
      tags,
      attachments,
      customFields,
      dueDate,
      estimatedResolutionTime,
      sla
    } = req.body;

    const ticket = new SupportTicket({
      organizationId: req.user.organizationId,
      subject,
      description,
      priority,
      category,
      subcategory,
      tags,
      attachments,
      customFields,
      dueDate,
      estimatedResolutionTime,
      sla,
      requester: req.user.id
    });

    await ticket.save();

    // Add initial activity
    await ticket.addActivity('created', 'Ticket created', req.user.id);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   PUT /api/v1/support-tickets/:id
 * @desc    Update ticket
 * @access  Private
 */
router.put('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this ticket'
      });
    }

    const oldStatus = ticket.status;
    const oldPriority = ticket.priority;
    const oldAssignee = ticket.assignee;

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Add activity for status change
    if (oldStatus !== updatedTicket.status) {
      await updatedTicket.addActivity(
        'status_changed',
        `Status changed from ${oldStatus} to ${updatedTicket.status}`,
        req.user.id
      );
    }

    // Add activity for priority change
    if (oldPriority !== updatedTicket.priority) {
      await updatedTicket.addActivity(
        'priority_changed',
        `Priority changed from ${oldPriority} to ${updatedTicket.priority}`,
        req.user.id
      );
    }

    // Add activity for assignment change
    if (oldAssignee?.toString() !== updatedTicket.assignee?.toString()) {
      await updatedTicket.addActivity(
        'assigned',
        `Ticket assigned to ${updatedTicket.assignee ? 'new assignee' : 'unassigned'}`,
        req.user.id
      );
    }

    res.status(200).json({
      success: true,
      data: updatedTicket
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   DELETE /api/v1/support-tickets/:id
 * @desc    Delete ticket
 * @access  Private
 */
router.delete('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this ticket'
      });
    }

    await ticket.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/support-tickets/:id/assign
 * @desc    Assign ticket to user
 * @access  Private
 */
router.post('/:id/assign', auth.protect, requireMFA, async (req, res) => {
  try {
    const { assigneeId } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to assign this ticket'
      });
    }

    ticket.assignee = assigneeId;
    ticket.assignedAt = new Date();
    await ticket.save();

    await ticket.addActivity(
      'assigned',
      `Ticket assigned to user ${assigneeId}`,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/support-tickets/:id/resolve
 * @desc    Resolve ticket
 * @access  Private
 */
router.post('/:id/resolve', auth.protect, requireMFA, async (req, res) => {
  try {
    const { resolutionNotes } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to resolve this ticket'
      });
    }

    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user.id;
    ticket.resolutionNotes = resolutionNotes;
    await ticket.save();

    await ticket.addActivity(
      'resolved',
      `Ticket resolved: ${resolutionNotes}`,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/support-tickets/:id/close
 * @desc    Close ticket
 * @access  Private
 */
router.post('/:id/close', auth.protect, requireMFA, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to close this ticket'
      });
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.closedBy = req.user.id;
    await ticket.save();

    await ticket.addActivity(
      'closed',
      'Ticket closed',
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/support-tickets/:id/escalate
 * @desc    Escalate ticket
 * @access  Private
 */
router.post('/:id/escalate', auth.protect, requireMFA, async (req, res) => {
  try {
    const { level, reason } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to escalate this ticket'
      });
    }

    await ticket.escalate(level, reason, req.user.id);

    await ticket.addActivity(
      'escalated',
      `Ticket escalated to level ${level}: ${reason}`,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/support-tickets/:id/note
 * @desc    Add internal note to ticket
 * @access  Private
 */
router.post('/:id/note', auth.protect, async (req, res) => {
  try {
    const { content, isPrivate = true } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add notes to this ticket'
      });
    }

    await ticket.addInternalNote(content, req.user.id, isPrivate);

    await ticket.addActivity(
      'commented',
      `Internal note added: ${content.substring(0, 50)}...`,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/support-tickets/:id/satisfaction
 * @desc    Submit satisfaction rating
 * @access  Private
 */
router.post('/:id/satisfaction', auth.protect, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user is the requester
    if (ticket.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the ticket requester can submit satisfaction rating'
      });
    }

    await ticket.updateSatisfaction(rating, feedback);

    res.status(200).json({
      success: true,
      data: ticket.satisfaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router; 
