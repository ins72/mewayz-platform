const User = require('../../models/appModels/User');
const Product = require('../../models/appModels/Product');
const Transaction = require('../../models/appModels/Transaction');
const Setting = require('../../models/coreModels/Setting');
const Admin = require('../../models/coreModels/Admin');
const Notification = require('../../models/appModels/Notification');
const Message = require('../../models/appModels/Message');
const Income = require('../../models/appModels/Income');
const Payout = require('../../models/appModels/Payout');
const Refund = require('../../models/appModels/Refund');
const Creator = require('../../models/appModels/Creator');
const ShopItem = require('../../models/appModels/ShopItem');
const PricingPlan = require('../../models/appModels/PricingPlan');
const Affiliate = require('../../models/appModels/Affiliate');
const Promotion = require('../../models/appModels/Promotion');
const Insight = require('../../models/appModels/Insight');
const Comment = require('../../models/appModels/Comment');
const Quote = require('../../models/appModels/Quote');
const Invoice = require('../../models/appModels/Invoice');
const Payment = require('../../models/appModels/Payment');
const Client = require('../../models/appModels/Client');
const mongoose = require('mongoose');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

// Admin Dashboard Controllers
const adminController = {
  // Dashboard Statistics
  getDashboardStats: async (req, res) => {
    try {
      const [
        totalUsers,
        totalProducts,
        totalTransactions,
        totalRevenue,
        activeUsers,
        newUsersThisMonth,
        totalCreators,
        totalAffiliates
      ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Transaction.countDocuments(),
        Transaction.aggregate([
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        User.countDocuments({ status: 'active' }),
        User.countDocuments({
          createdAt: { $gte: moment().startOf('month').toDate() }
        }),
        Creator.countDocuments(),
        Affiliate.countDocuments()
      ]);

      const revenue = totalRevenue[0]?.total || 0;
      const systemStats = {
        cpu: os.loadavg()[0],
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        uptime: os.uptime()
      };

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers,
            newThisMonth: newUsersThisMonth
          },
          products: {
            total: totalProducts
          },
          transactions: {
            total: totalTransactions,
            revenue: revenue
          },
          creators: {
            total: totalCreators
          },
          affiliates: {
            total: totalAffiliates
          },
          system: systemStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard stats',
        error: error.message
      });
    }
  },

  // System Health
  getSystemHealth: async (req, res) => {
    try {
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      const memoryUsage = process.memoryUsage();
      const systemLoad = os.loadavg();
      
      const health = {
        database: dbStatus,
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        cpu: {
          load1: systemLoad[0],
          load5: systemLoad[1],
          load15: systemLoad[2]
        },
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: os.platform()
      };

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching system health',
        error: error.message
      });
    }
  },

  // Recent Activity
  getRecentActivity: async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      
      const activities = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(limit / 4).select('name email createdAt'),
        Transaction.find().sort({ createdAt: -1 }).limit(limit / 4).select('amount type createdAt'),
        Product.find().sort({ createdAt: -1 }).limit(limit / 4).select('name price createdAt'),
        Comment.find().sort({ createdAt: -1 }).limit(limit / 4).select('content createdAt')
      ]);

      const [users, transactions, products, comments] = activities;
      
      const recentActivity = [
        ...users.map(user => ({
          type: 'user_created',
          action: 'New user registered',
          description: `${user.name} (${user.email})`,
          time: user.createdAt,
          icon: 'user'
        })),
        ...transactions.map(transaction => ({
          type: 'transaction',
          action: 'New transaction',
          description: `$${transaction.amount} - ${transaction.type}`,
          time: transaction.createdAt,
          icon: 'dollar'
        })),
        ...products.map(product => ({
          type: 'product_created',
          action: 'New product added',
          description: `${product.name} - $${product.price}`,
          time: product.createdAt,
          icon: 'package'
        })),
        ...comments.map(comment => ({
          type: 'comment',
          action: 'New comment',
          description: comment.content.substring(0, 50) + '...',
          time: comment.createdAt,
          icon: 'message'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, limit);

      res.json({
        success: true,
        data: recentActivity
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching recent activity',
        error: error.message
      });
    }
  },

  // System Alerts
  getSystemAlerts: async (req, res) => {
    try {
      const alerts = [];
      
      // Check system load
      const load = os.loadavg()[0];
      if (load > 0.8) {
        alerts.push({
          level: 'warning',
          title: 'High System Load',
          message: `System load is ${load.toFixed(2)}, consider scaling`,
          time: new Date()
        });
      }

      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      if (memoryPercent > 80) {
        alerts.push({
          level: 'warning',
          title: 'High Memory Usage',
          message: `Memory usage is ${memoryPercent.toFixed(1)}%`,
          time: new Date()
        });
      }

      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        alerts.push({
          level: 'error',
          title: 'Database Connection Issue',
          message: 'Database connection is not stable',
          time: new Date()
        });
      }

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching system alerts',
        error: error.message
      });
    }
  },

  // User Management
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status, role } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (status) query.status = status;
      if (role) query.role = role;

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const { name, email, password, role, status } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        status: status || 'active'
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, email, role, status } = req.body;
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (status) user.status = status;

      await user.save();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user status',
        error: error.message
      });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user role',
        error: error.message
      });
    }
  },

  // System Settings
  getSystemSettings: async (req, res) => {
    try {
      const settings = await Setting.find();
      const settingsObject = {};
      
      settings.forEach(setting => {
        settingsObject[setting.key] = setting.value;
      });

      res.json({
        success: true,
        data: settingsObject
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching system settings',
        error: error.message
      });
    }
  },

  updateSystemSettings: async (req, res) => {
    try {
      const settings = req.body;
      
      for (const [key, value] of Object.entries(settings)) {
        await Setting.findOneAndUpdate(
          { key },
          { value },
          { upsert: true, new: true }
        );
      }

      res.json({
        success: true,
        message: 'System settings updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating system settings',
        error: error.message
      });
    }
  },

  // Security Events
  getSecurityEvents: async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      
      // This would typically come from a security log collection
      // For now, we'll simulate security events
      const securityEvents = [
        {
          type: 'login_attempt',
          description: 'Failed login attempt from IP 192.168.1.100',
          severity: 'medium',
          timestamp: new Date(),
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        {
          type: 'suspicious_activity',
          description: 'Multiple failed login attempts detected',
          severity: 'high',
          timestamp: new Date(Date.now() - 3600000),
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0...'
        }
      ];

      res.json({
        success: true,
        data: securityEvents.slice(0, limit)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching security events',
        error: error.message
      });
    }
  },

  // Analytics Overview
  getAnalyticsOverview: async (req, res) => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        newUsersThisMonth,
        newUsersThisWeek,
        totalRevenue,
        revenueThisMonth,
        revenueThisWeek,
        totalTransactions,
        transactionsThisMonth,
        transactionsThisWeek
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: lastMonth } }),
        User.countDocuments({ createdAt: { $gte: lastWeek } }),
        Transaction.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
        Transaction.aggregate([
          { $match: { createdAt: { $gte: lastMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Transaction.aggregate([
          { $match: { createdAt: { $gte: lastWeek } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Transaction.countDocuments(),
        Transaction.countDocuments({ createdAt: { $gte: lastMonth } }),
        Transaction.countDocuments({ createdAt: { $gte: lastWeek } })
      ]);

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            newThisMonth: newUsersThisMonth,
            newThisWeek: newUsersThisWeek
          },
          revenue: {
            total: totalRevenue[0]?.total || 0,
            thisMonth: revenueThisMonth[0]?.total || 0,
            thisWeek: revenueThisWeek[0]?.total || 0
          },
          transactions: {
            total: totalTransactions,
            thisMonth: transactionsThisMonth,
            thisWeek: transactionsThisWeek
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics overview',
        error: error.message
      });
    }
  },

  // Database Stats
  getDatabaseStats: async (req, res) => {
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      const collections = await db.listCollections().toArray();
      const collectionStats = await Promise.all(
        collections.map(async (collection) => {
          const collStats = await db.collection(collection.name).stats();
          return {
            name: collection.name,
            count: collStats.count,
            size: collStats.size,
            avgObjSize: collStats.avgObjSize
          };
        })
      );

      res.json({
        success: true,
        data: {
          database: {
            name: stats.db,
            collections: stats.collections,
            views: stats.views,
            objects: stats.objects,
            avgObjSize: stats.avgObjSize,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize
          },
          collections: collectionStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching database stats',
        error: error.message
      });
    }
  },

  // Content Overview
  getContentOverview: async (req, res) => {
    try {
      const [
        totalProducts,
        totalCreators,
        totalAffiliates,
        totalPromotions,
        totalComments,
        totalQuotes,
        totalInvoices
      ] = await Promise.all([
        Product.countDocuments(),
        Creator.countDocuments(),
        Affiliate.countDocuments(),
        Promotion.countDocuments(),
        Comment.countDocuments(),
        Quote.countDocuments(),
        Invoice.countDocuments()
      ]);

      res.json({
        success: true,
        data: {
          products: totalProducts,
          creators: totalCreators,
          affiliates: totalAffiliates,
          promotions: totalPromotions,
          comments: totalComments,
          quotes: totalQuotes,
          invoices: totalInvoices
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching content overview',
        error: error.message
      });
    }
  }
};

module.exports = adminController; 