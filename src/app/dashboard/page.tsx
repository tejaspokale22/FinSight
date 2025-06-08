"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PlusIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { format } from "date-fns";
import Spinner from "@/components/Spinner";

enum TransactionCategory {
  FOOD = "FOOD",
  RENT = "RENT",
  TRAVEL = "TRAVEL",
  OTHER = "OTHER"
}

type Transaction = {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  [TransactionCategory.FOOD]: "Food",
  [TransactionCategory.RENT]: "Rent",
  [TransactionCategory.TRAVEL]: "Travel",
  [TransactionCategory.OTHER]: "Other"
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      setTransactions(data);
    } catch {
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyData = () => {
    const monthlyExpenses = transactions.reduce((acc, transaction) => {
      const month = format(new Date(transaction.date), "MMM yyyy");
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    // Get all months of the current year
    const months: string[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      const monthKey = format(date, "MMM yyyy");
      months.push(monthKey);
    }

    // Create data array with all months, using 0 for months with no transactions
    return months.map(month => ({
      month,
      amount: monthlyExpenses[month] || 0
    }));
  };

  const getCategoryData = () => {
    const categoryExpenses = transactions.reduce((acc, transaction) => {
      const category = transaction.category || TransactionCategory.OTHER;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(transaction.amount);
      return acc;
    }, {} as Record<TransactionCategory, number>);

    // Ensure all categories are represented, even if they have no transactions
    Object.values(TransactionCategory).forEach(category => {
      if (!categoryExpenses[category]) {
        categoryExpenses[category] = 0;
      }
    });

    return Object.entries(categoryExpenses).map(([name, value]) => ({
      name: CATEGORY_LABELS[name as TransactionCategory],
      value,
    }));
  };

  const getTotalMonthlyExpense = () => {
    const currentMonth = format(new Date(), "MMM yyyy");
    return transactions
      .filter((t) => format(new Date(t.date), "MMM yyyy") === currentMonth)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getRecentTransactions = () => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 sm:mb-0">
            Financial Dashboard
          </h1>
          <div className="flex gap-4">
            <Link
              href="/create-transactions"
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Transaction
            </Link>
            <Link
              href="/list-transactions"
              className="inline-flex items-center px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ListBulletIcon className="h-5 w-5 mr-2" />
              View History
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900">Total Monthly Expenses</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₹ {getTotalMonthlyExpense().toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900">Total Transactions</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {transactions.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900">Categories</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {Object.keys(TransactionCategory).length}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Expenses Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses</h3>
            <div className="h-[300px] sm:h-[350px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#8884d8" name="Monthly Expense">
                    {getMonthlyData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.amount > 0 ? "#8884d8" : "#e5e7eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
            <div className="h-[300px] sm:h-[350px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getRecentTransactions().map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {CATEGORY_LABELS[transaction.category]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={transaction.amount >= 0 ? "text-green-600" : "text-red-600"}>
                        ₹ {Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
