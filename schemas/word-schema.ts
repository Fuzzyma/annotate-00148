import * as z from "zod"

export const wordSchema = z.object({
  term: z.string().min(1, "Term is required"),
  definition: z.string().min(1, "Definition is required"),
  region: z.array(z.string()).min(1, "At least one region is required"),
  usageExamples: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .min(1, "At least one usage example is required"),
  contributor: z.string().optional(),
})

export type WordFormValues = z.infer<typeof wordSchema>

