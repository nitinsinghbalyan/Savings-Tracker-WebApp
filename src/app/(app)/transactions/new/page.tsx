import { AppShell } from "@/components/layout/AppShell";
import { TransactionForm } from "@/components/forms/transaction-form";

export default function NewTransactionPage() {
  return (
    <AppShell title="Log contribution" showBack backHref="/dashboard">
      <TransactionForm />
    </AppShell>
  );
}
