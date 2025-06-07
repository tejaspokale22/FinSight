import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server";

// GET: All transactions
export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

// POST: Create new transaction
export async function POST(req: NextRequest) {
  try {
    const { amount, date, description, category } = await req.json();

    if (!amount || !date || !description) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const newTx = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        category,
      },
    });
    console.log(newTx);

    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
