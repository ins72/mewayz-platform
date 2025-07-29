const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');
const { requireMFA } = require('../middleware/mfa');

/**
 * @route   GET /api/v1/organizations
 * @desc    Get all organizations (admin only)
 * @access  Private/Admin
 */
router.get('/', auth.protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Add filters
    if (req.query.planType) {
      filter.planType = req.query.planType;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { subdomain: { $regex: req.query.search, $options: 'i' } },
        { customDomain: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const organizations = await Organization.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');

    const total = await Organization.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: organizations,
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
 * @route   GET /api/v1/organizations/:id
 * @desc    Get organization by ID
 * @access  Private
 */
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/organizations
 * @desc    Create new organization
 * @access  Private
 */
router.post('/', auth.protect, requireMFA, async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      logoUrl,
      subdomain,
      customDomain,
      planType,
      billingInfo,
      contactInfo
    } = req.body;

    // Check if subdomain already exists
    if (subdomain) {
      const existingOrg = await Organization.findOne({ subdomain });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          error: 'Subdomain already exists'
        });
      }
    }

    // Check if custom domain already exists
    if (customDomain) {
      const existingOrg = await Organization.findOne({ customDomain });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          error: 'Custom domain already exists'
        });
      }
    }

    const organization = new Organization({
      name,
      description,
      website,
      logoUrl,
      subdomain,
      customDomain,
      planType,
      billingInfo,
      contactInfo,
      createdBy: req.user.id
    });

    await organization.save();

    res.status(201).json({
      success: true,
      data: organization
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
 * @route   PUT /api/v1/organizations/:id
 * @desc    Update organization
 * @access  Private
 */
router.put('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check if subdomain already exists (if being changed)
    if (req.body.subdomain && req.body.subdomain !== organization.subdomain) {
      const existingOrg = await Organization.findOne({ subdomain: req.body.subdomain });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          error: 'Subdomain already exists'
        });
      }
    }

    // Check if custom domain already exists (if being changed)
    if (req.body.customDomain && req.body.customDomain !== organization.customDomain) {
      const existingOrg = await Organization.findOne({ customDomain: req.body.customDomain });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          error: 'Custom domain already exists'
        });
      }
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedOrganization
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
 * @route   DELETE /api/v1/organizations/:id
 * @desc    Delete organization
 * @access  Private/Admin
 */
router.delete('/:id', auth.protect, requireMFA, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await organization.remove();

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
 * @route   GET /api/v1/organizations/domain/:domain
 * @desc    Get organization by domain
 * @access  Public
 */
router.get('/domain/:domain', async (req, res) => {
  try {
    const organization = await Organization.findByDomain(req.params.domain);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/v1/organizations/:id/analytics
 * @desc    Get organization analytics
 * @access  Private
 */
router.get('/:id/analytics', auth.protect, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // This would be populated with actual analytics data
    const analytics = {
      totalUsers: 0,
      totalProducts: 0,
      totalRevenue: 0,
      monthlyGrowth: 0,
      activeUsers: 0,
      storageUsed: 0,
      storageLimit: organization.limits.storage,
      apiCallsUsed: 0,
      apiCallsLimit: organization.limits.apiCalls
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/organizations/:id/upgrade
 * @desc    Upgrade organization plan
 * @access  Private
 */
router.post('/:id/upgrade', auth.protect, requireMFA, async (req, res) => {
  try {
    const { planType } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    organization.planType = planType;
    await organization.save();

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/organizations/:id/suspend
 * @desc    Suspend organization
 * @access  Private/Admin
 */
router.post('/:id/suspend', auth.protect, requireMFA, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    organization.status = 'suspended';
    await organization.save();

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/v1/organizations/:id/activate
 * @desc    Activate organization
 * @access  Private/Admin
 */
router.post('/:id/activate', auth.protect, requireMFA, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    organization.status = 'active';
    await organization.save();

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router; 
