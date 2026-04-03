import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Other';
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  deletedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePicture: String,
    bio: String,
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], required: true },
    height: { type: Number, required: true },
    currentWeight: { type: Number, required: true },
    targetWeight: { type: Number, required: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    deletedAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
