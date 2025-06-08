import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server";
import { TransactionCategory } from "@prisma/client";
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const CACHE_TTL = 60 * 5; // 5 minutes in seconds

// GET: All transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Create cache key
    const cacheKey = `transactions:${year}:${month}`;

    // Try to get data from cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // If not in cache, fetch from database
    const transactions = await prisma.transaction.findMany({
      where: month && year ? {
        date: {
          gte: new Date(parseInt(year), parseInt(month) - 1, 1),
          lt: new Date(parseInt(year), parseInt(month), 1),
        },
      } : undefined,
      orderBy: {
        date: 'desc',
      },
    });

    // Store in cache with TTL
    await redis.set(cacheKey, transactions, { ex: CACHE_TTL });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST: Create new transaction
export async function POST(req: NextRequest) {
  try {
    const { amount, date, description, category } = await req.json();

    if (!amount || !date || !description) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Validate category
    if (!category || !Object.values(TransactionCategory).includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: FOOD, RENT, TRAVEL, OTHER" },
        { status: 400 }
      );
    }

    const newTx = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        category: category as TransactionCategory,
      },
    });

    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}


