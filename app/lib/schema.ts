import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.number().min(0, "Initial balance is required"),
  currency: z.string().min(1, "Currency is required"),
  isDefault: z.boolean().default(false),
});

export type AccountFormData = z.infer<typeof accountSchema>;