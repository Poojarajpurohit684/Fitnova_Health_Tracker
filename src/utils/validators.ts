import { createError, ErrorCode } from './errors';

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 12) errors.push('Password must be at least 12 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character (!@#$%^&*)');
    return { valid: errors.length === 0, errors };
  },

  name: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100;
  },

  exerciseType: (type: string): boolean => {
    const validTypes = ['Running', 'Weight Training', 'Cycling', 'Swimming', 'HIIT', 'Yoga', 'Pilates', 'Other'];
    return validTypes.includes(type);
  },

  intensity: (intensity: number): boolean => {
    return intensity >= 1 && intensity <= 10 && Number.isInteger(intensity);
  },

  duration: (duration: number): boolean => {
    return duration > 0 && duration <= 480; // Max 8 hours
  },

  calories: (calories: number): boolean => {
    return calories >= 0 && calories <= 10000;
  },

  mealType: (type: string): boolean => {
    const validTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    return validTypes.includes(type.toLowerCase());
  },

  macros: (protein: number, carbs: number, fats: number): boolean => {
    return protein >= 0 && carbs >= 0 && fats >= 0 && protein <= 500 && carbs <= 500 && fats <= 500;
  },
};

export const validateEmail = (email: string): void => {
  if (!validators.email(email)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Invalid email format', 400);
  }
};

export const validatePassword = (password: string): void => {
  const { valid, errors } = validators.password(password);
  if (!valid) {
    throw createError(ErrorCode.VALIDATION_ERROR, errors.join(', '), 400);
  }
};

export const validateName = (name: string): void => {
  if (!validators.name(name)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Name must be between 2 and 100 characters', 400);
  }
};

export const validateWorkout = (exerciseType: string, duration: number, intensity: number): void => {
  if (!validators.exerciseType(exerciseType)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Invalid exercise type', 400);
  }
  if (!validators.duration(duration)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Duration must be between 1 and 480 minutes', 400);
  }
  if (!validators.intensity(intensity)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Intensity must be between 1 and 10', 400);
  }
};

export const validateNutrition = (
  mealType: string,
  calories: number,
  protein: number,
  carbs: number,
  fats: number
): void => {
  if (!validators.mealType(mealType)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Invalid meal type', 400);
  }
  if (!validators.calories(calories)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Calories must be between 0 and 10000', 400);
  }
  if (!validators.macros(protein, carbs, fats)) {
    throw createError(ErrorCode.VALIDATION_ERROR, 'Invalid macro values', 400);
  }
};
