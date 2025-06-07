"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type FormData = {
  amount: number;
  date: string;
  description: string;
  category: string;
};

export default function TransactionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);

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
      reset(); // clear form
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white rounded shadow max-w-md">
      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          step="0.01"
          {...register("amount", { required: "Amount is required", min: 1 })}
        />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
      </div>

      <div>
        <Label>Date</Label>
        <Input
          type="date"
          {...register("date", { required: "Date is required" })}
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
      </div>

      <div>
        <Label>Description</Label>
        <Input
          type="text"
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      <div>
        <Label>Category</Label>
        <Input
          type="text"
          {...register("category")}
          placeholder="e.g. Food, Rent, Transport"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Transaction"}
      </Button>
    </form>
  );
}
