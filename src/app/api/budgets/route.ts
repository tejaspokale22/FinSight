import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Month and year parameters are required" },
        { status: 400 }
      );
    }

    const budgets = await prisma.budget.findMany({
      where: {
        month: parseInt(month),
        year: parseInt(year),
      },
      orderBy: {
        category: 'asc',
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category, amount, month, year } = await request.json();

    // Validate input
    if (!category || !amount || !month || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.budget.findFirst({
      where: {
        category,
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    if (existing) {
      // Update existing budget
      const updated = await prisma.budget.update({
        where: { id: existing.id },
        data: { amount: parseFloat(amount) },
      });
      return NextResponse.json(updated);
    }

    // Create new budget
    const newBudget = await prisma.budget.create({
      data: {
        category,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error("Error setting budget:", error);
    return NextResponse.json(
      { error: "Failed to set budget" },
      { status: 500 }
    );
  }
}



