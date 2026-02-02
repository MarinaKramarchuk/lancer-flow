import { getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-accaunt-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import AccountCard from "./_components/account_card";
import { Account } from "@prisma/client";
import { getCurrentBudget } from "@/actions/budjet";
import BudgetProgress from "./_components/budget-progress";

const DashboardPage: React.FC = async () => {
  const accounts: Account[] = await getUserAccounts();

  const defaultAccount = accounts?.find(
    (account: Account) => account.isDefault,
  );

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Overview */}

      {/* Accounts Grid */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow ">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-4" />
              <p className="text-lg font-semibold">Create New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => {
            const formattedAccount = {
              ...account,
              balance: Number(account.balance),
            };

            return <AccountCard key={account.id} account={formattedAccount} />;
          })}
      </div>
    </div>
  );
};

export default DashboardPage;
