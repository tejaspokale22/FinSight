import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';

// Initialize Redis client
let redis: Redis;
try {
  redis = new Redis({
    url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL || '',
    token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN || '',
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

const CACHE_TTL = 60 * 5; // 5 minutes in seconds

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

    // Create cache key
    const cacheKey = `budgets:${year}:${month}`;

    // Try to get data from cache if Redis is available
    if (redis) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          return NextResponse.json(cachedData);
        }
      } catch (redisError) {
        console.error("Redis cache error:", redisError);
        // Continue with database fetch if cache fails
      }
    }

    // If not in cache or Redis fails, fetch from database
    const budgets = await prisma.budget.findMany({
      where: {
        month: parseInt(month),
        year: parseInt(year),
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Store in cache if Redis is available
    if (redis) {
      try {
        await redis.set(cacheKey, budgets, { ex: CACHE_TTL });
      } catch (redisError) {
        console.error("Redis cache set error:", redisError);
        // Continue even if cache set fails
      }
    }

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets. Please try again later." },
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



