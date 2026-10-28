import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Transaction from '../models/Transaction';
import CustomerProfile from '../models/CustomerProfile';
import User from '../models/User';

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.id;
    const { customerId, amount, type, notes, products, dueDate } = req.body;
    console.log('CRITICAL DEBUG - Received transaction request:', { vendorId, customerId, amount, type, notes, products, dueDate });

    if (!customerId || !amount || !type) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Verify the customer is linked to this vendor
    const link = await CustomerProfile.findOne({ vendorId, customerId });
    if (!link) {
      res.status(400).json({ message: 'Customer is not linked to your khata' });
      return;
    }

    const transaction = new Transaction({
      vendorId,
      customerId,
      amount: Number(amount),
      type, // 'credit' or 'payment'
      status: 'pending', // Requires mutual confirmation
      notes,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      products: products || []
    });

    await transaction.save();
    res.status(201).json({ message: 'Transaction request sent to customer', data: transaction });
  } catch (error) {
    console.error('CRITICAL: Create transaction error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getPendingTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    
    // Find all pending transactions for this customer and populate vendor details
    const transactions = await Transaction.find({ customerId, status: 'pending' })
      .populate('vendorId', 'name businessName')
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const transaction = await Transaction.findOne({ _id: id, customerId, status: 'pending' });
    if (!transaction) {
      res.status(404).json({ message: 'Pending transaction not found' });
      return;
    }

    transaction.status = status;
    await transaction.save();

    // If approved, update the CustomerProfile ledger balances
    if (status === 'approved') {
      const link = await CustomerProfile.findOne({ vendorId: transaction.vendorId, customerId });
      
      if (link) {
        if (transaction.type === 'credit') {
          link.totalCredit += transaction.amount;
          link.outstandingBalance += transaction.amount;
        } else if (transaction.type === 'payment') {
          link.totalPaid += transaction.amount;
          link.outstandingBalance -= transaction.amount; // Decrease outstanding on payment
        }
        await link.save();
      }
    }

    res.status(200).json({ message: `Transaction ${status}`, data: transaction });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const payVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { vendorId, amount, notes } = req.body;

    if (!vendorId || !amount) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Find the link
    const link = await CustomerProfile.findOne({ vendorId, customerId });
    if (!link) {
      res.status(400).json({ message: 'Vendor not linked to your account' });
      return;
    }

    // Create the transaction directly as 'approved' because it's a direct payment
    const transaction = new Transaction({
      vendorId,
      customerId,
      type: 'payment',
      amount: Number(amount),
      status: 'approved',
      notes: notes || 'UPI Payment Settle'
    });
    
    await transaction.save();

    // Update balances
    link.outstandingBalance -= Number(amount);
    link.totalPaid += Number(amount);
    await link.save();

    res.status(201).json({ message: 'Payment recorded successfully', transaction });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const buyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { vendorId, amount, notes, products, dueDate } = req.body;

    if (!vendorId || !amount) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const link = await CustomerProfile.findOne({ vendorId, customerId });
    if (!link) {
      res.status(400).json({ message: 'Vendor not linked to your account' });
      return;
    }

    const transaction = new Transaction({
      vendorId,
      customerId,
      type: 'credit',
      amount: Number(amount),
      status: 'pending', // Vendor needs to approve the credit purchase
      notes: notes || 'Online Catalog Purchase',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      products: products || []
    });
    
    await transaction.save();

    res.status(201).json({ message: 'Purchase requested successfully', transaction });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};
