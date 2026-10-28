import mongoose from 'mongoose';
import CustomerProfile from './src/models/CustomerProfile';

mongoose.connect('mongodb://localhost:27017/lendtrack').then(async () => {
  const links = await CustomerProfile.find({}).populate('customerId');
  console.log(JSON.stringify(links, null, 2));
  process.exit();
});
