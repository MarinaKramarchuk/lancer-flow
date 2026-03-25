"use server";
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";
import { calculateNextRecurringDate } from "@/lib/utils";
import { RecurringInterval, TransactionType } from "@prisma/client";

type UpdateTransactionInput = {
  amount?: number;
  type?: TransactionType;
  date?: Date | string;
  accountId?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval | null;
};
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
const serializeAmount = <T extends { amount: Prisma.Decimal }>(obj: T) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

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
          },
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
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(
                  new Date(data.date),
                  data.recurringInterval,
                )
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

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function scanReceipt(file: File) {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
    Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: base64String,
              },
            },
          ],
        },
      ],
    });

    const text = result.text;

    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount) || 0,
        date: new Date(data.date) || null,
        description: data.description || "",
        merchantName: data.merchantName || "",
        category: data.category || "other-expense",
      };
    } catch (parseError) {
      console.error("Error parsing JSON from model response:", parseError);
      throw new Error("Failed to parse receipt information");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw error;
  }
}

export async function getTransaction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const transaction = await db.transaction.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return serializeAmount(transaction);
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput ,
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: { account: true },
    });

    if (!originalTransaction) {
      throw new Error("Transaction not found");
    }

    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const amount = data.amount ?? oldBalanceChange;

    const netBalanceChange = data.type === "EXPENSE" ? -amount : amount;

    const transaction = await db.$transaction(async (tx) => {
      const getDate = (date: any): Date => {
        if (date instanceof Date) return date;
        if (typeof date === "string") return new Date(date);
        if (date?.set) return new Date(date.set);

        return new Date(); // fallback
      };

      const interval = data.recurringInterval;

      const updated = await tx.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(
                  getDate(data.date ?? originalTransaction.date),
                  interval!,
                )
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          }
        },
      });
      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}
