import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'vendor' | 'customer' | 'admin';
  businessName?: string; // For vendors
  panCard?: string;
  phone?: string;
  firebaseUid?: string;
  isEmailVerified: boolean;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using Firebase Auth exclusively, but good for local auth fallback
    role: { type: String, enum: ['vendor', 'customer', 'admin'], default: 'customer' },
    businessName: { type: String },
    panCard: { type: String },
    phone: { type: String },
    firebaseUid: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    resetPasswordTokenHash: { type: String },
    resetPasswordExpiresAt: { type: Date },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
