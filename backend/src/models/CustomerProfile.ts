import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerProfile extends Document {
  vendorId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  outstandingBalance: number;
  totalCredit: number;
  totalPaid: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerProfileSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    outstandingBalance: { type: Number, default: 0 },
    totalCredit: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);
