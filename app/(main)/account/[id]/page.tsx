import { getAccountWithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TransactionTable from "../_components/transaction-table";
import { BarLoader } from "react-spinners";
import AccountChart from "../_components/account-chart";

const AccountPage = async ({ params }: { params: { id: string } }) => { 
  const { id } = await params;

  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const {transactions, ...account} = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between"> 
        <div>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight capitalize">{account.name}</h1>
          <p className="mt-2 text-muted-foreground">{account.type.charAt(0).toUpperCase() + account.type.slice(1).toLowerCase()} Account</p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${account.balance.toFixed(2)}
          </div>
          <p className="text-sm text-mutrd-foreground"> 
            {account._count?.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#1c398e" />}>
        <AccountChart transactions={transactions} />
      </Suspense>
  
      {/* Transactions List Section */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#1c398e" />}>
        <TransactionTable transactions={transactions} />
      </Suspense>

    </div>

  );
};

export default AccountPage;