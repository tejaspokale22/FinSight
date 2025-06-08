"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import Spinner from "@/components/Spinner";

type Budget = {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
};

type Transaction = {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
};

type BudgetComparison = {
  category: string;
  budget: number;
  actual: number;
  difference: number;
};

export default function BudgetInsights() {
  const currentDate = new Date();
  const [currentMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [currentYear] = useState(currentDate.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [comparison, setComparison] = useState<BudgetComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch budgets
      const budgetsRes = await fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`);
      if (!budgetsRes.ok) throw new Error("Failed to fetch budgets");
      const budgetsData = await budgetsRes.json();
      setBudgets(budgetsData);

      // Fetch transactions
      const transactionsRes = await fetch("/api/transactions");
      if (!transactionsRes.ok) throw new Error("Failed to fetch transactions");
      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData);

      // Calculate comparison
      const comparisonData = calculateComparison(budgetsData, transactionsData);
      setComparison(comparisonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateComparison = (
    budgets: Budget[],
    transactions: Transaction[]
  ): BudgetComparison[] => {
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() + 1 === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    return budgets.map((budget) => {
      const actual = currentMonthTransactions
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: budget.category,
        budget: budget.amount,
        actual,
        difference: budget.amount - actual,
      };
    });
  };

  const getTopSpendingCategory = () => {
    if (comparison.length === 0) return null;
    return comparison.reduce((max, curr) =>
      curr.actual > max.actual ? curr : max
    );
  };

  const getOverBudgetCategories = () => {
    return comparison.filter((item) => item.difference < 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Budget vs Actual Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Budget vs Actual Spending</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#8884d8" />
              <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Spending Category */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Top Spending Category</h3>
          {getTopSpendingCategory() ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {getTopSpendingCategory()?.category}
              </p>
              <p className="text-gray-600">
                ₹{getTopSpendingCategory()?.actual.toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No spending data available</p>
          )}
        </div>

        {/* Over Budget Categories */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Over Budget Categories</h3>
          {getOverBudgetCategories().length > 0 ? (
            <ul className="space-y-2">
              {getOverBudgetCategories().map((category) => (
                <li
                  key={category.category}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{category.category}</span>
                  <span className="text-red-500">
                    ₹{Math.abs(category.difference).toLocaleString()} over
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-500">All categories are within budget!</p>
          )}
        </div>
      </div>
    </div>
  );
} 