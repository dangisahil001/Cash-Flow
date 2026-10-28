import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  vendorId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  type: 'credit' | 'payment';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  dueDate?: Date;
  products?: Array<{ productId: mongoose.Types.ObjectId, quantity: number, price: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'payment'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    notes: { type: String },
    dueDate: { type: Date },
    products: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number },
      price: { type: Number }
    }]
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
