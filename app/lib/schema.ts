import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.number().min(0, "Initial balance is required"),
  currency: z.string().min(1, "Currency is required"),
  isDefault: z.boolean().default(false),
});
export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.date({ message: "Date is required" }),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
}).superRefine((data, ctx) => {
  if (data.isRecurring && !data.recurringInterval) {
    ctx.addIssue({
      code: "custom",
      message: "Recurring interval is required for recurring transactions",
      path: ["recurringInterval"],
    });
  }
});

export type AccountFormData = z.infer<typeof accountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;