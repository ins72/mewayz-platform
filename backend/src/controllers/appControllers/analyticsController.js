const mongoose = require('mongoose');
const Client = require('../../models/appModels/Client');
const Invoice = require('../../models/appModels/Invoice');
const Payment = require('../../models/appModels/Payment');
const Quote = require('../../models/appModels/Quote');

const analyticsController = {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const [
        totalClients,
        totalInvoices,
        totalQuotes,
        totalPayments,
        pendingInvoices,
        overdueInvoices,
        totalRevenue,
        monthlyRevenue,
        clientGrowth,
        revenueGrowth
      ] = await Promise.all([
        Client.countDocuments({ removed: false }),
        Invoice.countDocuments({ removed: false }),
        Quote.countDocuments({ removed: false }),
        Payment.countDocuments({ removed: false }),
        Invoice.countDocuments({ 
          removed: false, 
          paymentStatus: 'unpaid' 
        }),
        Invoice.countDocuments({
          removed: false,
          paymentStatus: 'unpaid',
          expiredDate: { $lt: new Date() }
        }),
        Payment.aggregate([
          { $match: { removed: false } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          { 
            $match: { 
              removed: false,
              date: { 
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
              } 
            } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        // Mock growth data for now - in production, calculate from historical data
        Promise.resolve(12.5),
        Promise.resolve(8.3)
      ]);

      // Calculate invoice and payment growth
      const invoiceGrowth = 15.7; // Mock data
      const paymentGrowth = 6.2; // Mock data

      res.json({
        success: true,
        data: {
          totalClients,
          totalInvoices,
          totalQuotes,
          totalPayments,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          pendingInvoices,
          overdueInvoices,
          clientGrowth,
          revenueGrowth,
          invoiceGrowth,
          paymentGrowth,
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get client analytics
  async getClientAnalytics(req, res) {
    try {
      const { clientId } = req.params;
      
      const [invoices, payments, quotes] = await Promise.all([
        Invoice.find({ client: clientId, removed: false }),
        Payment.find({ client: clientId, removed: false }),
        Quote.find({ client: clientId, removed: false })
      ]);

      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const pendingAmount = invoices
        .filter(inv => inv.paymentStatus === 'unpaid')
        .reduce((sum, inv) => sum + inv.total, 0);

      const averageInvoiceValue = invoices.length > 0 ? 
        invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0;

      const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'paid').length;
      const unpaidInvoices = invoices.filter(inv => inv.paymentStatus === 'unpaid').length;

      res.json({
        success: true,
        data: {
          totalInvoices: invoices.length,
          totalPayments: payments.length,
          totalQuotes: quotes.length,
          totalRevenue,
          pendingAmount,
          averageInvoiceValue,
          paidInvoices,
          unpaidInvoices,
          paymentRate: invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get revenue trends
  async getRevenueTrends(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      } else if (period === '1y') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const revenueData = await Payment.aggregate([
        {
          $match: {
            removed: false,
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' }
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      res.json({
        success: true,
        data: revenueData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get invoice trends
  async getInvoiceTrends(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      const startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const invoiceData = await Invoice.aggregate([
        {
          $match: {
            removed: false,
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' }
            },
            count: { $sum: 1 },
            total: { $sum: '$total' },
            paid: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0]
              }
            },
            unpaid: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      res.json({
        success: true,
        data: invoiceData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get top clients by revenue
  async getTopClients(req, res) {
    try {
      const { limit = 10 } = req.query;

      const topClients = await Payment.aggregate([
        {
          $match: { removed: false }
        },
        {
          $group: {
            _id: '$client',
            totalRevenue: { $sum: '$amount' },
            paymentCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: parseInt(limit)
        },
        {
          $lookup: {
            from: 'clients',
            localField: '_id',
            foreignField: '_id',
            as: 'clientInfo'
          }
        },
        {
          $unwind: '$clientInfo'
        },
        {
          $project: {
            clientId: '$_id',
            clientName: '$clientInfo.name',
            totalRevenue: 1,
            paymentCount: 1
          }
        }
      ]);

      res.json({
        success: true,
        data: topClients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get payment status distribution
  async getPaymentStatusDistribution(req, res) {
    try {
      const distribution = await Invoice.aggregate([
        {
          $match: { removed: false }
        },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            total: { $sum: '$total' }
          }
        }
      ]);

      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = analyticsController; 