import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Product from '../models/Product';
import CustomerProfile from '../models/CustomerProfile';
import mongoose from 'mongoose';

export const addProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.id;
    const { name, category, description, price, stock, imageUrl } = req.body;

    if (!name || !price || !category) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const product = new Product({
      vendorId,
      name,
      category,
      description,
      price: Number(price),
      stock: Number(stock || 0),
      imageUrl
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getVendorProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;
    const products = await Product.find({ vendorId });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.id;
    const products = await Product.find({ vendorId });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
