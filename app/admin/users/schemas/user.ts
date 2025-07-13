import { z } from "zod";
import { GenderType } from "@/db/schema";

// Schema for user form validation
export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      "Name can only contain letters, spaces, dots, apostrophes, and hyphens"
    ),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(255, "Username must be less than 255 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, underscores, dots, and hyphens"
    )
    .optional(),
  studentId: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length >= 3, {
      message: "Student ID must be at least 3 characters if provided",
    })
    .refine((val) => !val || val.length <= 255, {
      message: "Student ID must be less than 255 characters",
    })
    .refine((val) => !val || /^[a-zA-Z0-9-]+$/.test(val), {
      message: "Student ID can only contain letters, numbers, and hyphens",
    }),
  gender: z
    .enum([GenderType.MALE, GenderType.FEMALE, GenderType.OTHER])
    .optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[\+]?[\d\s\-\(\)]+$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  department: z
    .string()
    .trim()
    .max(255, "Department must be less than 255 characters")
    .optional(),
  startingSemester: z
    .string()
    .trim()
    .max(255, "Starting semester must be less than 255 characters")
    .optional(),
  codeforcesHandle: z
    .string()
    .trim()
    .max(255, "Codeforces handle must be less than 255 characters")
    .optional(),
  atcoderHandle: z
    .string()
    .trim()
    .max(255, "AtCoder handle must be less than 255 characters")
    .optional(),
  vjudgeHandle: z
    .string()
    .trim()
    .max(255, "VJudge handle must be less than 255 characters")
    .optional(),
  maxCfRating: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Rating must be a number",
    })
    .refine((val) => !val || parseInt(val) >= 0, {
      message: "Rating must be a positive number",
    })
    .refine((val) => !val || parseInt(val) <= 4000, {
      message: "Rating seems too high",
    }),
});

// Type for the user form values
export type UserFormValues = z.infer<typeof userFormSchema>;
