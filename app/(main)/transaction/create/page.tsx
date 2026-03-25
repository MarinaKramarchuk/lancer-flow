import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const params = await searchParams;
  const editId = params.edit;
  const accounts = await getUserAccounts();

  let initialData = null;
  if (editId) {
    try {
      const transaction = await getTransaction(editId);
      initialData = {
        ...transaction,
        amount: transaction.amount.toString(),
        category: transaction.category,
        date: new Date(transaction.date),
      };
    } catch (error) {
      console.error("Error fetching transaction for editing:", error);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl font-bold text-[#0A192F] mb-6">
        {editId ? "Edit" : "Add"} Transaction
      </h1>

      <AddTransactionForm
        key={editId || "new"}
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
