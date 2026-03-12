"use server"
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const serializeAmount = <T extends { amount: Prisma.Decimal }>(obj: T) => ({
  ...obj,
  amount: obj.amount.toNumber(),
}
);

export async function createTransaction(
  data: Prisma.TransactionUncheckedCreateInput,
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    // Get t=request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) { 
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          }
        });
        throw new Error(`Rate limit exceeded. Try again later.`);
      }
      throw new Error("Request Blocked");
    }


    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + Number(balanceChange);

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.reccurringInterval
              ? calculateNextReccurringDate(new Date(data.date), data.reccurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: account.id },
        data: { balance: new Prisma.Decimal(newBalance) },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return {success: true, data: serializeAmount(transaction)};
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

function calculateNextReccurringDate(startDate: Date, interval: string) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid recurring interval");
  }
  return date;
}