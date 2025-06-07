import TransactionForm from "@/components/TransactionForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-2xl font-bold mb-6">Add New Transaction</h1>
      <TransactionForm />
    </main>
  );
}
