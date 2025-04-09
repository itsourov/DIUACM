import { z } from "zod";

export const ranklistFormSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  description: z.string().optional().nullable(),
  weightOfUpsolve: z.coerce
    .number()
    .min(0)
    .max(1, "Weight must be between 0 and 1"),
});

export type RanklistFormValues = z.infer<typeof ranklistFormSchema>;
