import { z } from "zod";
import { GenderType } from "@/db/schema";

// Schema for user creation/editing in admin panel
export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .optional()
    .nullable()
    .or(z.literal("")),
  gender: z.enum([GenderType.MALE, GenderType.FEMALE, GenderType.OTHER] as const).optional(),
  phone: z.string().optional().nullable(),
  codeforcesHandle: z.string().optional().nullable(),
  atcoderHandle: z.string().optional().nullable(),
  vjudgeHandle: z.string().optional().nullable(),
  startingSemester: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

// For when editing existing users, password is optional
export const userUpdateFormSchema = userFormSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type UserUpdateFormValues = z.infer<typeof userUpdateFormSchema>;
