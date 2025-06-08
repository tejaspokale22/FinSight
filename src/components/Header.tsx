'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-black">
                FinSight
              </span>
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link href="/dashboard" className="text-base font-normal text-gray-500 hover:text-gray-900 transition-colors duration-200">
                Dashboard
              </Link>
              <Link href="/budget" className="text-base font-normal text-gray-500 hover:text-gray-900 transition-colors duration-200">
                Budget
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/dashboard" className="block px-3 py-2 text-base font-normal text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Dashboard
            </Link>
            <Link href="/expenses" className="block px-3 py-2 text-base font-normal text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Expenses
            </Link>
            <Link href="/budget" className="block px-3 py-2 text-base font-normal text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Budget
            </Link>
            <Link href="/analytics" className="block px-3 py-2 text-base font-normal text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Analytics
            </Link>
            <div className="mt-4 px-3">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
} 