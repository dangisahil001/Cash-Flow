import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import User from '../models/User';
import CustomerProfile from '../models/CustomerProfile';

export const searchCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query; // email or phone
    if (!query) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const customer = await User.findOne({
      $or: [{ email: query as string }, { phone: query as string }],
      role: 'customer'
    }).select('name email phone _id isEmailVerified');

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const linkCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.id;
    const { customerId } = req.body;

    if (!customerId) {
      res.status(400).json({ message: 'Customer ID is required' });
      return;
    }

    // Check if link already exists
    const existingLink = await CustomerProfile.findOne({ vendorId, customerId });
    if (existingLink) {
      res.status(400).json({ message: 'Customer is already linked to your khata' });
      return;
    }

    const newLink = new CustomerProfile({
      vendorId,
      customerId,
      outstandingBalance: 0,
      totalCredit: 0,
      totalPaid: 0
    });

    await newLink.save();
    res.status(201).json({ message: 'Customer linked successfully', data: newLink });
  } catch (error) {
    console.error('Link customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLinkedCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.id;
    const links = await CustomerProfile.find({ vendorId }).populate('customerId', 'name email phone');
    
    // Transform to match frontend table structure
    const customers = links.map(link => {
      const cust = link.customerId as any;
      return {
        id: link._id,
        userId: cust._id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        balance: link.outstandingBalance,
        status: 'Active'
      };
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error('Get linked customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLinkedVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const links = await CustomerProfile.find({ customerId }).populate('vendorId', 'name businessName email phone');
    
    const vendors = links.map(link => {
      const vendor = link.vendorId as any;
      return {
        _id: vendor._id,
        name: vendor.name,
        businessName: vendor.businessName,
        email: vendor.email,
        phone: vendor.phone,
        balanceToPay: link.outstandingBalance
      };
    });

    res.status(200).json(vendors);
  } catch (error) {
    console.error('Get linked vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
