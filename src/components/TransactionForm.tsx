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

enum TransactionCategory {
  FOOD = "FOOD",
  RENT = "RENT",
  TRAVEL = "TRAVEL",
  OTHER = "OTHER"
}

type FormData = {
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
};

export default function TransactionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to add transaction");
      }

      const result = await res.json();
      console.log("Added transaction:", result);
      reset();
      toast({
        title: "Success!",
        description: "Transaction has been added successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to add transaction. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Add a new transaction</h2>
      
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

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Date</Label>
        <Input
          type="date"
          className="w-full rounded-md border border-gray-300"
          {...register("date", { required: "Date is required" })}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Description</Label>
        <Input
          type="text"
          className="w-full rounded-md border border-gray-300"
          placeholder="Enter transaction description"
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

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

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </span>
        ) : (
          "Add Transaction"
        )}
      </Button>
    </form>
  );
}
