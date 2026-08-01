import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";
import { calculateNextRecurringDate } from "@/lib/utils";

export const checkBudgetAlert = inngest.createFunction(
  {
    id: "checkBudgetAlerts",
    name: "Check Budget Alerts",
  },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        );

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = Number(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        const lastAlertDate = budget.lastAlertSent
          ? new Date(budget.lastAlertSent)
          : null;

        if (
          percentageUsed >= 80 &&
          (!lastAlertDate || isNewMonth(lastAlertDate, currentDate))
        ) {
          if (!budget.user.email) {
            console.error(
              `Skipping budget alert for budget ${budget.id}: user has no email`,
            );
            return;
          }

          const emailResult = await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name ?? "User",
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount,
                totalExpenses,
                accountName: defaultAccount.name,
              },
            }),
          });

          if (!emailResult.success) {
            console.error(
              `Failed to send budget alert for budget ${budget.id}:`,
              emailResult.error,
            );
            return;
          }

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  },
);

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "triggerRecurringTransactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const transactions = await step.run(
      "fetch-recurring-transactions",

      //fetch all transactions that are recurring, completed and either have never been processed or have a nextRecurringDate in the past
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              {
                lastProcessed: null,
              },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
        });
      },
    );

    // create events for each transaction

    if (transactions.length > 0) {
      const events = transactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      // send events to be processed

      await inngest.send(events);
    }

    return { triggered: transactions.length };
  },
);

export const processRecurringTransactions = inngest.createFunction(
  {
    id: "process-recurring-transactions",
    throttle: {
      limit: 10, // Limit to 10 concurrent executions
      period: "1m", // Per minute
      key: "event.data.userId", // per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event.data.transactionId || !event.data.userId) {
      console.error("Invalid event data", event.data);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) {
        return;
      }

      await db.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval || "MONTHLY",
            ),
          },
        });
      });
    });
  },
);

function isTransactionDue(transaction: any) {
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDate = new Date(transaction.nextRecurringDate);

  return nextDate <= today;
}

async function getMonthlyStats(userId: string, month: Date) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
  });

  return transactions.reduce(
    (stats, transaction) => {
      const amount = transaction.amount.toNumber();
      if (transaction.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[transaction.category] =
          (stats.byCategory[transaction.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {} as Record<string, number>,
    },
  );
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany();
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);

        if (stats.totalIncome === 0 && stats.totalExpenses === 0) {
          return;
        }

        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const emailResult = await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name ?? "User",
            type: "monthly-report",
            data: {
              month: monthName,
              stats,
            },
          }),
        });

        if (!emailResult.success) {
          console.error(
            `Failed to send monthly report for user ${user.id}:`,
            emailResult.error,
          );
        }
      });
    }

    return { processed: users.length };
  },
);
