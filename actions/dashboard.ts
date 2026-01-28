"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj: any) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

export async function createAccount(data: Prisma.AccountCreateInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const balanceFloat = parseFloat(data.balance as unknown as string);
    if (isNaN(balanceFloat) || balanceFloat < 0) {
      throw new Error("Invalid balance amount");
    }
    
    const existingAccount = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault = existingAccount.length === 0 ? true : data.isDefault;

    // If this account is set as default, unset previous default accounts
   
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    const serializedAccount = serializeTransaction(account);
    
    revalidatePath("/dashboard");

    return { succes: true, data: serializedAccount };

  } catch (error: any) {
    throw new Error(error.message);
   }
}

export async function getUserAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true },
        }
      },
    });

    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;

  } catch (error: any) {
    throw new Error(error.message);
  }
} 