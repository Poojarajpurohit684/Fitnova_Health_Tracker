import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseType: string;
  duration: number;
  intensity: number;
  caloriesBurned: number;
  notes?: string;
  startTime: Date;
  endTime: Date;
  distance?: number;
  sets?: number;
  reps?: number;
  weight?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workoutSchema = new Schema<IWorkout>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseType: { type: String, required: true },
    duration: { type: Number, required: true },
    intensity: { type: Number, required: true, min: 1, max: 10 },
    caloriesBurned: { type: Number, required: true },
    notes: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    distance: Number,
    sets: Number,
    reps: Number,
    weight: Number,
    heartRateAvg: Number,
    heartRateMax: Number,
    location: String,
  },
  { timestamps: true }
);

workoutSchema.index({ userId: 1, createdAt: -1 });

export const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);
