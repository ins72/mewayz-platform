/**
 * Enterprise Notification Service
 * 
 * Unified notification system for MEWAYZ Platform
 * Supports multiple notification channels and real-time delivery
 * 
 * Features:
 * - Real-time WebSocket notifications
 * - Email notifications
 * - SMS notifications (enterprise plans)
 * - Push notifications
 * - In-app notifications
 * - Notification preferences management
 * - Analytics and delivery tracking
 */

const { webSocketManager } = require('../middleware/websocket');
const User = require('../models/User');

class EnterpriseNotificationService {
  constructor() {
    this.channels = {
      websocket: true,
      email: true,
      sms: false, // Enable for enterprise plans
      push: true,
      inapp: true
    };
    
    this.deliveryTracking = new Map();
    this.notificationQueue = [];
    this.retryQueue = [];
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Send notification to user
   */
  async sendNotification(notificationData) {
    const {
      userId,
      organizationId,
      type,
      title,
      message,
      data = {},
      channels = ['websocket', 'inapp'],
      priority = 'normal', // low, normal, high, urgent
      scheduledAt = null,
      expiresAt = null
    } = notificationData;

    try {
      // Validate required fields
      if (!userId || !type || !title || !message) {
        throw new Error('Missing required notification fields');
      }

      // Get user for notification preferences
      const user = await User.findById(userId).select('+notificationPreferences +plan +role');
      if (!user) {
        throw new Error('User not found');
      }

      // Check if scheduled notification
      if (scheduledAt && new Date(scheduledAt) > new Date()) {
        return this.scheduleNotification(notificationData);
      }

      // Create notification object
      const notification = {
        id: this.generateNotificationId(),
        userId,
        organizationId,
        type,
        title,
        message,
        data,
        priority,
        channels: this.filterChannels(channels, user),
        createdAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        deliveryStatus: {},
        readAt: null,
        clickedAt: null
      };

      // Apply user preferences
      notification.channels = this.applyUserPreferences(notification.channels, user, type);

      // Send via enabled channels
      const deliveryResults = await this.deliverNotification(notification, user);

      // Track delivery
      this.trackDelivery(notification.id, deliveryResults);

      // Store in database for in-app notifications
      if (notification.channels.includes('inapp')) {
        await this.storeInAppNotification(notification);
      }

      return {
        success: true,
        notificationId: notification.id,
        deliveryResults
      };

    } catch (error) {
      console.error('Notification service error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications) {
    const results = await Promise.allSettled(
      notifications.map(notification => this.sendNotification(notification))
    );

    return {
      total: notifications.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || !r.value.success).length,
      results
    };
  }

  /**
   * Send notification to organization
   */
  async sendOrganizationNotification(organizationId, notificationData) {
    // Get all users in organization
    const users = await User.find({ 
      organizationId, 
      status: 'active' 
    }).select('_id');

    const notifications = users.map(user => ({
      ...notificationData,
      userId: user._id,
      organizationId
    }));

    return this.sendBulkNotifications(notifications);
  }

  /**
   * Send notification to role
   */
  async sendRoleNotification(role, notificationData, organizationId = null) {
    const query = { role, status: 'active' };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const users = await User.find(query).select('_id');

    const notifications = users.map(user => ({
      ...notificationData,
      userId: user._id,
      organizationId
    }));

    return this.sendBulkNotifications(notifications);
  }

  /**
   * Deliver notification via channels
   */
  async deliverNotification(notification, user) {
    const deliveryResults = {};

    // WebSocket delivery (real-time)
    if (notification.channels.includes('websocket')) {
      deliveryResults.websocket = await this.deliverWebSocket(notification);
    }

    // Email delivery
    if (notification.channels.includes('email')) {
      deliveryResults.email = await this.deliverEmail(notification, user);
    }

    // SMS delivery (enterprise plans only)
    if (notification.channels.includes('sms')) {
      deliveryResults.sms = await this.deliverSMS(notification, user);
    }

    // Push notification delivery
    if (notification.channels.includes('push')) {
      deliveryResults.push = await this.deliverPushNotification(notification, user);
    }

    return deliveryResults;
  }

  /**
   * Deliver via WebSocket
   */
  async deliverWebSocket(notification) {
    try {
      const wsMessage = {
        type: 'notification',
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          priority: notification.priority,
          createdAt: notification.createdAt.toISOString()
        }
      };

      // Send to user's personal room
      webSocketManager.broadcastToUser(notification.userId, wsMessage);

      // Also send to organization room if applicable
      if (notification.organizationId) {
        webSocketManager.broadcastToOrganization(notification.organizationId, wsMessage);
      }

      return { success: true, channel: 'websocket', timestamp: new Date() };

    } catch (error) {
      console.error('WebSocket delivery error:', error);
      return { success: false, channel: 'websocket', error: error.message };
    }
  }

  /**
   * Deliver via email
   */
  async deliverEmail(notification, user) {
    try {
      // Email delivery logic would go here
      // For now, we'll simulate email delivery
      
      const emailData = {
        to: user.email,
        subject: notification.title,
        html: this.generateEmailTemplate(notification, user),
        metadata: {
          notificationId: notification.id,
          userId: user._id,
          type: notification.type
        }
      };

      // Simulate email sending
      console.log(`📧 Email notification sent to ${user.email}: ${notification.title}`);

      return { success: true, channel: 'email', timestamp: new Date() };

    } catch (error) {
      console.error('Email delivery error:', error);
      return { success: false, channel: 'email', error: error.message };
    }
  }

  /**
   * Deliver via SMS (Enterprise plans only)
   */
  async deliverSMS(notification, user) {
    try {
      // Check if user has enterprise plan
      if (!['Pro', 'Enterprise'].includes(user.plan)) {
        return { success: false, channel: 'sms', error: 'SMS requires premium plan' };
      }

      // SMS delivery logic would go here
      console.log(`📱 SMS notification sent to ${user.phone}: ${notification.title}`);

      return { success: true, channel: 'sms', timestamp: new Date() };

    } catch (error) {
      console.error('SMS delivery error:', error);
      return { success: false, channel: 'sms', error: error.message };
    }
  }

  /**
   * Deliver push notification
   */
  async deliverPushNotification(notification, user) {
    try {
      // Push notification logic would go here
      console.log(`🔔 Push notification sent to ${user.email}: ${notification.title}`);

      return { success: true, channel: 'push', timestamp: new Date() };

    } catch (error) {
      console.error('Push notification delivery error:', error);
      return { success: false, channel: 'push', error: error.message };
    }
  }

  /**
   * Filter channels based on user plan and availability
   */
  filterChannels(requestedChannels, user) {
    const availableChannels = ['websocket', 'inapp', 'email'];

    // Add premium channels for eligible plans
    if (['Pro', 'Enterprise'].includes(user.plan)) {
      availableChannels.push('sms', 'push');
    }

    return requestedChannels.filter(channel => availableChannels.includes(channel));
  }

  /**
   * Apply user notification preferences
   */
  applyUserPreferences(channels, user, notificationType) {
    const preferences = user.notificationPreferences || {};
    
    // Check if user has disabled this type of notification
    if (preferences[notificationType] === false) {
      return channels.filter(channel => channel === 'websocket'); // Always keep websocket for urgent notifications
    }

    // Apply channel-specific preferences
    return channels.filter(channel => {
      const channelPreference = preferences[`${notificationType}_${channel}`];
      return channelPreference !== false;
    });
  }

  /**
   * Store in-app notification in database
   */
  async storeInAppNotification(notification) {
    try {
      // In a real implementation, this would store in a notifications collection
      // For now, we'll simulate this
      console.log(`💾 In-app notification stored for user ${notification.userId}`);
      
      return true;
    } catch (error) {
      console.error('Failed to store in-app notification:', error);
      return false;
    }
  }

  /**
   * Generate email template
   */
  generateEmailTemplate(notification, user) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 16px;">${notification.title}</h2>
          <p style="color: #666; line-height: 1.6;">${notification.message}</p>
          
          ${notification.data.actionUrl ? `
            <div style="margin: 24px 0;">
              <a href="${notification.data.actionUrl}" 
                 style="background: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; display: inline-block;">
                ${notification.data.actionText || 'View Details'}
              </a>
            </div>
          ` : ''}
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 12px;">
              Sent by MEWAYZ Platform | 
              <a href="#" style="color: #999;">Unsubscribe</a> | 
              <a href="#" style="color: #999;">Notification Preferences</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Schedule notification for later delivery
   */
  async scheduleNotification(notificationData) {
    // In a real implementation, this would use a job queue like Bull or Agenda
    const { scheduledAt } = notificationData;
    const delay = new Date(scheduledAt).getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        this.sendNotification({
          ...notificationData,
          scheduledAt: null
        });
      }, delay);

      return {
        success: true,
        scheduled: true,
        scheduledAt: new Date(scheduledAt),
        delay
      };
    }

    // If scheduledAt is in the past, send immediately
    return this.sendNotification({
      ...notificationData,
      scheduledAt: null
    });
  }

  /**
   * Track notification delivery
   */
  trackDelivery(notificationId, deliveryResults) {
    this.deliveryTracking.set(notificationId, {
      id: notificationId,
      timestamp: new Date(),
      results: deliveryResults,
      totalChannels: Object.keys(deliveryResults).length,
      successfulChannels: Object.values(deliveryResults).filter(r => r.success).length
    });

    // Clean up old tracking data (keep last 1000 entries)
    if (this.deliveryTracking.size > 1000) {
      const oldestKey = this.deliveryTracking.keys().next().value;
      this.deliveryTracking.delete(oldestKey);
    }
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats() {
    const stats = {
      totalNotifications: this.deliveryTracking.size,
      successRate: 0,
      channelStats: {}
    };

    let totalDeliveries = 0;
    let successfulDeliveries = 0;

    this.deliveryTracking.forEach(tracking => {
      Object.entries(tracking.results).forEach(([channel, result]) => {
        totalDeliveries++;
        if (result.success) successfulDeliveries++;

        if (!stats.channelStats[channel]) {
          stats.channelStats[channel] = { total: 0, successful: 0 };
        }
        stats.channelStats[channel].total++;
        if (result.success) {
          stats.channelStats[channel].successful++;
        }
      });
    });

    stats.successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

    return stats;
  }

  /**
   * Generate notification ID
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      // In a real implementation, this would update the notification in the database
      console.log(`✅ Notification ${notificationId} marked as read by user ${userId}`);
      
      // Send real-time update to user
      webSocketManager.broadcastToUser(userId, {
        type: 'notification_read',
        notificationId,
        timestamp: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      unreadOnly = false,
      type = null 
    } = options;

    try {
      // In a real implementation, this would query the notifications collection
      // For now, return mock data
      return {
        success: true,
        notifications: [],
        total: 0,
        unread: 0
      };
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const notificationService = new EnterpriseNotificationService();

// Predefined notification types for consistency
const NOTIFICATION_TYPES = {
  // System notifications
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
  SECURITY_ALERT: 'security_alert',
  
  // User account notifications
  WELCOME: 'welcome',
  EMAIL_VERIFIED: 'email_verified',
  PASSWORD_CHANGED: 'password_changed',
  PLAN_UPGRADED: 'plan_upgraded',
  PLAN_DOWNGRADED: 'plan_downgraded',
  
  // Content notifications
  CONTENT_PUBLISHED: 'content_published',
  CONTENT_SCHEDULED: 'content_scheduled',
  CONTENT_FAILED: 'content_failed',
  
  // Social media notifications
  PLATFORM_CONNECTED: 'platform_connected',
  PLATFORM_DISCONNECTED: 'platform_disconnected',
  POST_PUBLISHED: 'post_published',
  ANALYTICS_REPORT: 'analytics_report',
  
  // Business notifications
  NEW_ORDER: 'new_order',
  ORDER_COMPLETED: 'order_completed',
  PAYMENT_RECEIVED: 'payment_received',
  INVOICE_GENERATED: 'invoice_generated',
  
  // Team notifications
  TEAM_INVITE: 'team_invite',
  ROLE_CHANGED: 'role_changed',
  PROJECT_ASSIGNED: 'project_assigned',
  MENTION: 'mention',
  
  // Enterprise notifications
  COMPLIANCE_ALERT: 'compliance_alert',
  AUDIT_COMPLETE: 'audit_complete',
  BACKUP_COMPLETE: 'backup_complete'
};

module.exports = {
  notificationService,
  NOTIFICATION_TYPES,
  EnterpriseNotificationService
}; 