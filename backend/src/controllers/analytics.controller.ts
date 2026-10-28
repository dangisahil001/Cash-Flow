import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import CustomerProfile from '../models/CustomerProfile';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

export const getVendorStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.id;
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    // 1. Calculate overall stats from CustomerProfile links
    const profileStats = await CustomerProfile.aggregate([
      { $match: { vendorId: vendorObjectId } },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$outstandingBalance' },
          totalCreditGiven: { $sum: '$totalCredit' },
          totalPaymentsReceived: { $sum: '$totalPaid' }
        }
      }
    ]);

    const stats = profileStats[0] || { totalOutstanding: 0, totalCreditGiven: 0, totalPaymentsReceived: 0 };

    // 2. Get recent approved transactions for the chart
    const recentTransactions = await Transaction.find({ 
      vendorId: vendorObjectId, 
      status: 'approved' 
    })
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(30);

    // Format data for Recharts (group by date) using ascending order for chart
    const chartTransactions = [...recentTransactions].reverse();
    const chartDataMap: Record<string, any> = {};
    chartTransactions.forEach(trx => {
      const dateStr = trx.createdAt.toISOString().split('T')[0];
      if (!chartDataMap[dateStr]) {
        chartDataMap[dateStr] = { name: dateStr, credit: 0, payment: 0 };
      }
      if (trx.type === 'credit') chartDataMap[dateStr].credit += trx.amount;
      if (trx.type === 'payment') chartDataMap[dateStr].payment += trx.amount;
    });

    const chartData = Object.values(chartDataMap);

    res.status(200).json({ stats, chartData, recentTransactions });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const customerObjectId = new mongoose.Types.ObjectId(customerId);

    // 1. Calculate overall stats from CustomerProfile links
    const profileStats = await CustomerProfile.aggregate([
      { $match: { customerId: customerObjectId } },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$outstandingBalance' },
          totalCreditTaken: { $sum: '$totalCredit' },
          totalPaymentsMade: { $sum: '$totalPaid' }
        }
      }
    ]);

    const stats = profileStats[0] || { totalOutstanding: 0, totalCreditTaken: 0, totalPaymentsMade: 0 };

    // 2. Get recent approved transactions for history table
    const recentTransactions = await Transaction.find({ 
      customerId: customerObjectId, 
      status: 'approved' 
    })
    .populate('vendorId', 'name businessName')
    .sort({ createdAt: -1 })
    .limit(10);

    res.status(200).json({ stats, recentTransactions });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
