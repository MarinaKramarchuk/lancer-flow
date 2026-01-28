import { getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-accaunt-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import AccountCard from "./_components/account_card";

const DashboardPage: React.FC = async () => {
  const accounts = await getUserAccounts();
  
  return (
    <div className="px-5">
      {/* Budget Progress */}

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
          accounts?.map((account) => {
            return <AccountCard key={account.id} account={account} />;
        })}

      </div>
    </div>
  );
}

export default DashboardPage;