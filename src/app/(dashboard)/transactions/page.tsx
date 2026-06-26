import { Receipt } from "lucide-react";

import { getProfile, getTransactions } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transações · Family Budget AI Pro" };

export default async function TransactionsPage() {
  const [profile, transactions] = await Promise.all([
    getProfile(),
    getTransactions(),
  ]);
  const currency = profile?.currency ?? "EUR";

  return (
    <div className="space-y-2">
      <PageHeader
        title="Transações"
        description="Todos os teus movimentos, categorizados pela IA."
      >
        <AddTransactionDialog />
      </PageHeader>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sem transações"
          description="Importa um extrato ou adiciona movimentos manualmente para começar."
          actionLabel="Importar extrato"
          actionHref="/upload"
        />
      ) : (
        <TransactionsView transactions={transactions} currency={currency} />
      )}
    </div>
  );
}
