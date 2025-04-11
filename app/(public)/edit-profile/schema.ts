import { z } from "zod";
import { Gender } from "@prisma/client";

// Edit profile form validation schema
export const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
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
  gender: z.nativeEnum(Gender).optional().nullable(),
  phone: z.string().optional().nullable(),
  codeforcesHandle: z.string().optional().nullable(),
  atcoderHandle: z.string().optional().nullable(),
  vjudgeHandle: z.string().optional().nullable(),
  startingSemester: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

// Form values type for TypeScript
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
