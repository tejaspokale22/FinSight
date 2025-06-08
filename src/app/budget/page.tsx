import BudgetForm from "@/components/BudgetForm";
import BudgetInsights from "@/components/BudgetInsights";

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Budget Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Set budgets and track your spending
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <BudgetForm />
          </div>
          <div>
            <BudgetInsights />
          </div>
        </div>
      </div>
    </div>
  );
} 