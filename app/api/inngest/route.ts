import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlert,
  triggerRecurringTransactions,
  processRecurringTransactions,
  generateMonthlyReports,
} from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlert,
    triggerRecurringTransactions,
    processRecurringTransactions,
    generateMonthlyReports,
  ],
});