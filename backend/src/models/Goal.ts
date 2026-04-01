import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  goalType: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility';
  targetValue: number;
  initialValue: number;
  currentValue: number;
  unit: string;
  targetDate: Date;
  startDate: Date;
  status: 'active' | 'completed' | 'abandoned';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalType: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility'],
      required: true,
    },
    targetValue: { type: Number, required: true },
    initialValue: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    unit: { type: String, required: true },
    targetDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    description: String,
    completedAt: Date,
  },
  { timestamps: true }
);

goalSchema.index({ userId: 1, status: 1 });

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
