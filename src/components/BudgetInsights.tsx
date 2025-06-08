"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

interface BudgetComparison {
  category: string;
  budget: number;
  actual: number;
  difference: number;
}

interface ChartData {
  data: BudgetComparison[];
  loading: boolean;
  error: string | null;
}

export default function BudgetInsights() {
  // Use useEffect to ensure date is only calculated on the client side
  const [dateState, setDateState] = useState({
    month: 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    const now = new Date();
    setDateState({
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });
  }, []);

  const [chartData, setChartData] = useState<ChartData>({
    data: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setChartData(prev => ({ ...prev, loading: true }));
      
      const [budgetsRes, transactionsRes] = await Promise.all([
        fetch(`/api/budgets?month=${dateState.month}&year=${dateState.year}`),
        fetch("/api/transactions")
      ]);

      if (!budgetsRes.ok || !transactionsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [budgetsData, transactionsData] = await Promise.all([
        budgetsRes.json(),
        transactionsRes.json()
      ]);

      const comparisonData = calculateComparison(budgetsData, transactionsData);
      setChartData({
        data: comparisonData,
        loading: false,
        error: null
      });
    } catch (err) {
      setChartData({
        data: [],
        loading: false,
        error: err instanceof Error ? err.message : "An error occurred"
      });
    }
  }, [dateState.month, dateState.year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateComparison = useCallback((
    budgets: Budget[],
    transactions: Transaction[]
  ): BudgetComparison[] => {
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() + 1 === dateState.month &&
        transactionDate.getFullYear() === dateState.year
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
  }, [dateState.month, dateState.year]);

  const topSpendingCategory = useMemo(() => {
    if (chartData.data.length === 0) return null;
    return chartData.data.reduce((max, curr) =>
      curr.actual > max.actual ? curr : max
    );
  }, [chartData.data]);

  const overBudgetCategories = useMemo(() => {
    return chartData.data.filter((item) => item.difference < 0);
  }, [chartData.data]);

  if (chartData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (chartData.error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p className="text-lg font-medium">{chartData.error}</p>
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
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
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
          {topSpendingCategory ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {topSpendingCategory.category}
              </p>
              <p className="text-gray-600">
                ₹{topSpendingCategory.actual.toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No spending data available</p>
          )}
        </div>

        {/* Over Budget Categories */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Over Budget Categories</h3>
          {overBudgetCategories.length > 0 ? (
            <ul className="space-y-2">
              {overBudgetCategories.map((category) => (
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