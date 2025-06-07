import TransactionForm from "@/components/TransactionForm";

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Transactions
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Add and manage your financial transactions
          </p>
        </div>
        
        <div className="mt-8">
          <TransactionForm />
        </div>
      </div>
    </div>
  );
}
