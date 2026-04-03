import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  dateOfBirth: z.string()
    .refine(str => !isNaN(Date.parse(str)), { message: 'Invalid date format' })
    .transform(str => new Date(str)),
  gender: z.preprocess(
    (val) => {
      const map: Record<string, string> = { male: 'M', female: 'F', other: 'Other', m: 'M', f: 'F' };
      return typeof val === 'string' ? (map[val.toLowerCase()] ?? val) : val;
    },
    z.enum(['M', 'F', 'Other'], { errorMap: () => ({ message: 'Invalid gender. Use M, F, or Other' }) })
  ),
  height: z.number().positive('Height must be positive').max(300, 'Invalid height'),
  currentWeight: z.number().positive('Weight must be positive').max(500, 'Invalid weight'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Workout Schemas
export const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  description: z.string().max(500, 'Description too long').optional(),
  duration: z.number().positive('Duration must be positive').max(1440, 'Duration too long'),
  intensity: z.number().min(1, 'Intensity must be 1-10').max(10),
  caloriesBurned: z.number().positive('Calories must be positive').optional(),
  exerciseType: z.string().min(1, 'Exercise type is required').max(50),
  date: z.string().datetime('Invalid date format').optional(),
});

export const updateWorkoutSchema = createWorkoutSchema.partial();

// Nutrition Schemas
export const createNutritionSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], { errorMap: () => ({ message: 'Invalid meal type' }) }),
  foodName: z.string().min(1, 'Food name is required').max(100),
  calories: z.number().positive('Calories must be positive').max(10000),
  protein: z.number().nonnegative('Protein cannot be negative').optional(),
  carbs: z.number().nonnegative('Carbs cannot be negative').optional(),
  fat: z.number().nonnegative('Fat cannot be negative').optional(),
  date: z.string().datetime('Invalid date format').optional(),
});

export const updateNutritionSchema = createNutritionSchema.partial();

// Goal Schemas
export const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  description: z.string().max(500, 'Description too long').optional(),
  targetValue: z.number().positive('Target value must be positive'),
  currentValue: z.number().nonnegative('Current value cannot be negative'),
  unit: z.string().min(1, 'Unit is required').max(20),
  deadline: z.string().datetime('Invalid date format'),
  category: z.enum(['weight', 'strength', 'endurance', 'flexibility', 'other'], { errorMap: () => ({ message: 'Invalid category' }) }),
});

export const updateGoalSchema = createGoalSchema.partial();

// Validation helper
export function validateRequest(schema: z.ZodSchema<any>, data: unknown): any {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Validation failed', formattedErrors);
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
