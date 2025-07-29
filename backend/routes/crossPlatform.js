const express = require('express');
const router = express.Router();
const { authenticate, requireActive, requirePlan, auditLog } = require('../middleware/enterpriseAuth');
const PlatformConnection = require('../models/PlatformConnection');
const CrossPlatformContent = require('../models/CrossPlatformContent');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Platform Connections Routes
router.route('/platforms')
  .get(authenticate, requireActive, asyncHandler(async (req, res) => {
    // Get real platform connections from database
    const platforms = await PlatformConnection.getConnectedPlatforms(
      req.user._id, 
      req.user.organizationId
    );
    
    res.status(200).json({
      success: true,
      count: platforms.length,
      data: platforms
    });
  }))
  .post(authenticate, requireActive, asyncHandler(async (req, res) => {
    // Create new platform connection
    const { platform, username, platformUserId, accessToken, refreshToken, permissions } = req.body;
    
    // Check if connection already exists
    const existingConnection = await PlatformConnection.findOne({
      userId: req.user._id,
      platform: platform
    });
    
    if (existingConnection) {
      return next(new ErrorResponse(`Connection to ${platform} already exists`, 400));
    }
    
    const platformConnection = await PlatformConnection.create({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      platform,
      username,
      platformUserId,
      accessToken,
      refreshToken,
      permissions: permissions || ['read', 'write'],
      connected: true,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: platformConnection
    });
  }));

router.route('/platforms/:platform/connect')
  .post(authenticate, requireActive, asyncHandler(async (req, res) => {
    const { platform } = req.params;
    const { username, platformUserId, accessToken, refreshToken, permissions } = req.body;
    
    // Check if connection exists
    let platformConnection = await PlatformConnection.findOne({
      userId: req.user._id,
      platform: platform
    });
    
    if (platformConnection) {
      // Update existing connection
      platformConnection.connected = true;
      platformConnection.status = 'active';
      platformConnection.username = username;
      platformConnection.platformUserId = platformUserId;
      platformConnection.accessToken = accessToken;
      platformConnection.refreshToken = refreshToken;
      platformConnection.permissions = permissions || ['read', 'write'];
      platformConnection.lastSync = new Date();
      
      await platformConnection.save();
    } else {
      // Create new connection
      platformConnection = await PlatformConnection.create({
        userId: req.user._id,
        organizationId: req.user.organizationId,
        platform,
        username,
        platformUserId,
        accessToken,
        refreshToken,
        permissions: permissions || ['read', 'write'],
        connected: true,
        status: 'active'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully connected to ${platform}`,
      data: platformConnection
    });
  }));

router.route('/platforms/:platform/disconnect')
  .delete(authenticate, requireActive, asyncHandler(async (req, res) => {
    const { platform } = req.params;
    
    const platformConnection = await PlatformConnection.findOne({
      userId: req.user._id,
      platform: platform
    });
    
    if (!platformConnection) {
      return next(new ErrorResponse(`No connection found for ${platform}`, 404));
    }
    
    // Mark as disconnected instead of deleting
    platformConnection.connected = false;
    platformConnection.status = 'inactive';
    platformConnection.accessToken = undefined;
    platformConnection.refreshToken = undefined;
    
    await platformConnection.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully disconnected from ${platform}`
    });
  }));

router.route('/platforms/:platform/sync')
  .post(authenticate, requireActive, asyncHandler(async (req, res) => {
    const { platform } = req.params;
    
    const platformConnection = await PlatformConnection.findOne({
      userId: req.user._id,
      platform: platform,
      connected: true
    });
    
    if (!platformConnection) {
      return next(new ErrorResponse(`No active connection found for ${platform}`, 404));
    }
    
    // Update follower count and sync data
    const { followerCount, followingCount } = req.body;
    
    if (followerCount !== undefined) {
      await platformConnection.updateFollowerCount(followerCount);
    }
    
    if (followingCount !== undefined) {
      platformConnection.followingCount = followingCount;
      await platformConnection.save();
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully synced ${platform} data`,
      data: platformConnection
    });
  }));

// Content Publishing Routes
router.route('/content/publish')
  .post(authenticate, requireActive, asyncHandler(async (req, res) => {
    const { campaignName, contentTitle, contentBody, platforms, schedulePost, scheduledAt, tags, hashtags } = req.body;
    
    // Validate required fields
    if (!campaignName || !contentTitle || !contentBody || !platforms || platforms.length === 0) {
      return next(new ErrorResponse('Campaign name, content title, content body, and platforms are required', 400));
    }
    
    // Get platform connections for the user
    const userPlatforms = await PlatformConnection.find({
      userId: req.user._id,
      platform: { $in: platforms },
      connected: true,
      status: 'active'
    });
    
    if (userPlatforms.length === 0) {
      return next(new ErrorResponse('No active platform connections found for specified platforms', 400));
    }
    
    // Create platform versions
    const platformVersions = userPlatforms.map(connection => ({
      platform: connection.platform,
      platformConnectionId: connection._id,
      adaptedContent: {
        title: contentTitle,
        content: contentBody,
        platformSpecificData: {}
      },
      status: schedulePost ? 'scheduled' : 'publishing',
      scheduledAt: schedulePost ? new Date(scheduledAt) : undefined,
      publishedAt: schedulePost ? undefined : new Date()
    }));
    
    // Create cross-platform content
    const content = await CrossPlatformContent.create({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      campaignName,
      originalContent: {
        title: contentTitle,
        content: contentBody,
        contentType: 'post',
        tags: tags || [],
        hashtags: hashtags || []
      },
      platformVersions,
      overallStatus: schedulePost ? 'scheduled' : 'publishing',
      scheduledPublishAt: schedulePost ? new Date(scheduledAt) : undefined
    });
    
    // If not scheduled, simulate publishing process
    if (!schedulePost) {
      // In a real implementation, this would trigger actual platform publishing
      content.platformVersions = content.platformVersions.map(version => ({
        ...version,
        status: 'published',
        publishedAt: new Date(),
        analytics: { views: 0, likes: 0, shares: 0, comments: 0 }
      }));
      content.overallStatus = 'published';
      await content.save();
    }
    
    res.status(201).json({
      success: true,
      data: content
    });
  }));

router.route('/content/posts')
  .get(authenticate, requireActive, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    
    let query = { 
      userId: req.user._id, 
      isActive: true 
    };
    
    if (req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    
    if (status) {
      query.overallStatus = status;
    }
    
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      CrossPlatformContent.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email')
        .populate('organizationId', 'name'),
      CrossPlatformContent.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: posts
    });
  }));

router.route('/content/posts/:id')
  .get(authenticate, requireActive, asyncHandler(async (req, res) => {
    const post = await CrossPlatformContent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    }).populate('userId', 'name email');
    
    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  }))
  .put(authenticate, requireActive, asyncHandler(async (req, res) => {
    let post = await CrossPlatformContent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });
    
    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }
    
    // Only allow updates for draft or scheduled posts
    if (!['draft', 'scheduled'].includes(post.overallStatus)) {
      return next(new ErrorResponse('Cannot update published or failed posts', 400));
    }
    
    const allowedFields = ['campaignName', 'originalContent', 'scheduledPublishAt'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    post = await CrossPlatformContent.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: post
    });
  }))
  .delete(authenticate, requireActive, asyncHandler(async (req, res) => {
    const post = await CrossPlatformContent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });
    
    if (!post) {
      return next(new ErrorResponse('Post not found', 404));
    }
    
    // Soft delete
    post.isActive = false;
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  }));

// Analytics Routes
router.route('/analytics/performance')
  .get(authenticate, requireActive, asyncHandler(async (req, res) => {
    const { startDate, endDate, platform } = req.query;
    
    // Get real analytics data from database
    const analyticsData = await CrossPlatformContent.getAnalyticsSummary(
      req.user._id,
      req.user.organizationId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    
    // Get total followers across platforms
    const totalFollowersData = await PlatformConnection.getTotalFollowers(
      req.user._id,
      req.user.organizationId
    );
    
    const totalFollowers = totalFollowersData.length > 0 ? totalFollowersData[0].totalFollowers : 0;
    
    // Get platform-specific data if requested
    let platformData = null;
    if (platform) {
      const platformPosts = await CrossPlatformContent.find({
        userId: req.user._id,
        'platformVersions.platform': platform,
        overallStatus: { $in: ['published', 'partial'] },
        isActive: true
      });
      
      platformData = {
        platform,
        totalPosts: platformPosts.length,
        totalViews: platformPosts.reduce((sum, post) => {
          const platformVersion = post.platformVersions.find(v => v.platform === platform);
          return sum + (platformVersion?.analytics?.views || 0);
        }, 0),
        totalEngagement: platformPosts.reduce((sum, post) => {
          const platformVersion = post.platformVersions.find(v => v.platform === platform);
          return sum + (platformVersion?.analytics?.engagement || 0);
        }, 0)
      };
    }
    
    const responseData = {
      totalViews: analyticsData.length > 0 ? analyticsData[0].totalViews : 0,
      totalEngagement: analyticsData.length > 0 ? analyticsData[0].totalEngagement : 0,
      totalPosts: analyticsData.length > 0 ? analyticsData[0].totalPosts : 0,
      averageEngagement: analyticsData.length > 0 ? analyticsData[0].averageEngagement : 0,
      totalFollowers,
      growthRate: 0, // Would be calculated based on historical data
      platformSpecific: platformData
    };
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  }));

router.route('/analytics/platforms')
  .get(authenticate, requireActive, asyncHandler(async (req, res) => {
    // Get analytics breakdown by platform
    const platforms = await PlatformConnection.find({
      userId: req.user._id,
      connected: true,
      status: 'active',
      isActive: true
    });
    
    const platformAnalytics = await Promise.all(
      platforms.map(async (platform) => {
        const posts = await CrossPlatformContent.find({
          userId: req.user._id,
          'platformVersions.platform': platform.platform,
          overallStatus: { $in: ['published', 'partial'] },
          isActive: true
        });
        
        const totalViews = posts.reduce((sum, post) => {
          const platformVersion = post.platformVersions.find(v => v.platform === platform.platform);
          return sum + (platformVersion?.analytics?.views || 0);
        }, 0);
        
        const totalEngagement = posts.reduce((sum, post) => {
          const platformVersion = post.platformVersions.find(v => v.platform === platform.platform);
          return sum + (platformVersion?.analytics?.engagement || 0);
        }, 0);
        
        return {
          platform: platform.platform,
          username: platform.username,
          followerCount: platform.followerCount,
          totalPosts: posts.length,
          totalViews,
          totalEngagement,
          lastSync: platform.lastSync
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: platformAnalytics
    });
  }));

module.exports = router; 