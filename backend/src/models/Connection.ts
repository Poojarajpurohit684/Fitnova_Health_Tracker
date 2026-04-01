import mongoose, { Schema, Document } from 'mongoose';

export interface IConnection extends Document {
  userId: mongoose.Types.ObjectId;
  connectedUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const connectionSchema = new Schema<IConnection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    connectedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
      index: true,
    },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: Date,
  },
  { timestamps: true }
);

// Compound index for efficient queries
connectionSchema.index({ userId: 1, status: 1 });
connectionSchema.index({ connectedUserId: 1, status: 1 });

export const Connection = mongoose.model<IConnection>('Connection', connectionSchema);
