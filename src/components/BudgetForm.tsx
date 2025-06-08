"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/Spinner";

enum TransactionCategory {
  FOOD = "FOOD",
  RENT = "RENT",
  TRAVEL = "TRAVEL",
  OTHER = "OTHER"
}

type BudgetFormData = {
  category: TransactionCategory;
  amount: number;
  month: number;
  year: number;
};

export default function BudgetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BudgetFormData>();

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: BudgetFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to set budget");
      }

      const result = await res.json();
      console.log("Set budget:", result);
      reset();
      toast({
        title: "Success!",
        description: "Budget has been set successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to set budget. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Set Monthly Budget</h2>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Category</Label>
        <Select
          onValueChange={(value) => setValue("category", value as TransactionCategory)}
          {...register("category", { required: "Category is required" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white">
            <SelectItem value={TransactionCategory.FOOD}>Food</SelectItem>
            <SelectItem value={TransactionCategory.RENT}>Rent</SelectItem>
            <SelectItem value={TransactionCategory.TRAVEL}>Travel</SelectItem>
            <SelectItem value={TransactionCategory.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">₹</span>
          <Input
            type="number"
            step="0.01"
            className="pl-7 w-full rounded-md border border-gray-300"
            placeholder="0.00"
            {...register("amount", { required: "Amount is required", min: 1 })}
          />
        </div>
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">Month</Label>
          <Input
            type="number"
            min="1"
            max="12"
            className="w-full rounded-md border border-gray-300"
            {...register("month", { 
              required: "Month is required",
              min: { value: 1, message: "Month must be between 1 and 12" },
              max: { value: 12, message: "Month must be between 1 and 12" }
            })}
          />
          {errors.month && (
            <p className="text-red-500 text-sm mt-1">{errors.month.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">Year</Label>
          <Input
            type="number"
            min="2000"
            max="2100"
            className="w-full rounded-md border border-gray-300"
            {...register("year", { 
              required: "Year is required",
              min: { value: 2000, message: "Year must be between 2000 and 2100" },
              max: { value: 2100, message: "Year must be between 2000 and 2100" }
            })}
          />
          {errors.year && (
            <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <div className="flex items-center justify-center w-full">
            <Spinner size="sm" />
            <span className="ml-2">Setting...</span>
          </div>
        ) : (
          "Set Budget"
        )}
      </Button>
    </form>
  );
} 