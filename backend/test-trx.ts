import mongoose from 'mongoose';
import CustomerProfile from './src/models/CustomerProfile';
import Transaction from './src/models/Transaction';

mongoose.connect('mongodb://localhost:27017/lendtrack').then(async () => {
  try {
    const link = await CustomerProfile.findOne({});
    if (!link) {
      console.log('No links found');
      return;
    }

    console.log('Found link:', link);

    const transaction = new Transaction({
      vendorId: link.vendorId,
      customerId: link.customerId,
      amount: 500,
      type: 'credit',
      status: 'pending',
      notes: 'test'
    });

    await transaction.save();
    console.log('Transaction saved successfully:', transaction);
  } catch (error) {
    console.error('Error:', error);
  }
});
