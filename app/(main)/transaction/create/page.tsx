import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "../_components/transaction-form";

export default async function AddTransactionPage() {
  const accounts = await getUserAccounts();

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl font-bold text-[#0A192F] mb-6">
        Add Transaction
      </h1>

      <AddTransactionForm accounts={accounts} categories={defaultCategories} />
    </div>
  );
}
