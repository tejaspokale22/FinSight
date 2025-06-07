import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinSight — Personal Finance Tracker",
  description: "Take control of your financial future with FinSight - your comprehensive personal finance tracking solution. Track expenses, set budgets, and achieve your financial goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white poppins">
        {children}
      </body>
    </html>
  );
}
