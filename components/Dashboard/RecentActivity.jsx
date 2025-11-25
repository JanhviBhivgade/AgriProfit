"use client"

import { useMemo, useEffect } from "react"
import { format } from "date-fns"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
import { formatCurrency } from "@/lib/utils"

export function RecentActivity({ limit = 10 }) {
  const { expenses, loading: expensesLoading, fetchExpenses } = useExpenses()
  const { yields, loading: yieldsLoading, fetchYields } = useYields()

  // Fetch data on mount
  useEffect(() => {
    fetchExpenses()
    fetchYields()
  }, [fetchExpenses, fetchYields])

  const sortedExpenses = useMemo(() => {
    if (!expenses) return []
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses])

  const sortedYields = useMemo(() => {
    if (!yields) return []
    return [...yields]
      .sort((a, b) => new Date(b.harvest_date) - new Date(a.harvest_date))
  }, [yields])

  // Combine and sort all transactions
  const allTransactions = useMemo(() => {
    const transactions = []
    
    // Add expenses
    sortedExpenses.forEach((expense) => {
      transactions.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        name: expense.description || expense.category,
        description: expense.category,
        date: expense.date,
        amount: parseFloat(expense.amount || 0),
        status: 'completed',
        icon: '💰',
      })
    })
    
    // Add yields
    sortedYields.forEach((yieldRecord) => {
      transactions.push({
        id: `yield-${yieldRecord.id}`,
        type: 'yield',
        name: yieldRecord.crops?.name || 'Harvest',
        description: 'Crop Sale',
        date: yieldRecord.harvest_date,
        amount: parseFloat(yieldRecord.total_revenue || 0),
        status: 'completed',
        icon: '🌾',
      })
    })
    
    // Sort by date (newest first) and optionally limit
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    return typeof limit === "number" ? sortedTransactions.slice(0, limit) : sortedTransactions
  }, [limit, sortedExpenses, sortedYields])

  return (
    <div className="space-y-4">
      {expensesLoading || yieldsLoading ? (
        <div className="text-center py-8 text-gray-500">Loading transactions...</div>
      ) : allTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No transactions yet</div>
      ) : (
        <div className="space-y-2">
          {allTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar/Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white text-xl shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <span className="text-2xl">{transaction.icon}</span>
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {transaction.name}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(transaction.date), "hh:mm:ss a")}
                  </p>
                </div>
                
                {/* Amount */}
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'yield' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {transaction.type === 'yield' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`w-2 h-2 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="text-xs text-gray-600 capitalize">
                      {transaction.status === 'completed' ? 'Completed' : 'Pending...'}
                    </span>
                  </div>
                </div>
                
                {/* Dropdown arrow */}
                <button className="ml-2 p-1 hover:bg-gray-200 rounded">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

