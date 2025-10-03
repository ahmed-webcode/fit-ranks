import { z } from 'zod';

// Workout validation
export const workoutSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Workout name is required" })
    .max(100, { message: "Workout name must be less than 100 characters" }),
  notes: z.string()
    .max(500, { message: "Notes must be less than 500 characters" })
    .optional(),
  duration_minutes: z.number()
    .min(1, { message: "Duration must be at least 1 minute" })
    .max(600, { message: "Duration must be less than 600 minutes" })
    .optional(),
});

// Body measurement validation
export const bodyMeasurementSchema = z.object({
  weight: z.number()
    .min(20, { message: "Weight must be at least 20" })
    .max(500, { message: "Weight must be less than 500" })
    .optional(),
  height: z.number()
    .min(50, { message: "Height must be at least 50cm" })
    .max(300, { message: "Height must be less than 300cm" })
    .optional(),
  body_fat_percentage: z.number()
    .min(0, { message: "Body fat must be at least 0%" })
    .max(100, { message: "Body fat must be less than 100%" })
    .optional(),
  notes: z.string()
    .max(500, { message: "Notes must be less than 500 characters" })
    .optional(),
});

// Profile validation
export const profileSchema = z.object({
  username: z.string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must be less than 30 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  full_name: z.string()
    .trim()
    .max(100, { message: "Full name must be less than 100 characters" })
    .optional(),
  age: z.number()
    .min(13, { message: "Age must be at least 13" })
    .max(120, { message: "Age must be less than 120" })
    .optional(),
  fitness_goals: z.string()
    .max(500, { message: "Fitness goals must be less than 500 characters" })
    .optional(),
});

// Workout template validation
export const workoutTemplateSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Template name is required" })
    .max(100, { message: "Template name must be less than 100 characters" }),
  description: z.string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string()
    .max(50, { message: "Category must be less than 50 characters" })
    .optional(),
});

// Coach group validation
export const coachGroupSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Group name is required" })
    .max(100, { message: "Group name must be less than 100 characters" }),
  description: z.string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
});

// Workout share validation
export const workoutShareSchema = z.object({
  caption: z.string()
    .max(300, { message: "Caption must be less than 300 characters" })
    .optional(),
});
