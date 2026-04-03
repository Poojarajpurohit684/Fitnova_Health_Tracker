import mongoose, { Schema, Document } from 'mongoose';

export interface INutritionEntry extends Document {
  userId: mongoose.Types.ObjectId;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const nutritionEntrySchema = new Schema<INutritionEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fats: { type: Number, required: true },
    fiber: Number,
    sugar: Number,
    sodium: Number,
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    loggedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

nutritionEntrySchema.index({ userId: 1, loggedAt: -1 });

export const NutritionEntry = mongoose.model<INutritionEntry>(
  'NutritionEntry',
  nutritionEntrySchema
);
