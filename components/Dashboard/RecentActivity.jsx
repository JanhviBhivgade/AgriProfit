"use client"

import { useMemo, useEffect } from "react"
import { format } from "date-fns"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
import { formatCurrency } from "@/lib/utils"

export function RecentActivity() {
  const { expenses, loading: expensesLoading, fetchExpenses } = useExpenses()
  const { yields, loading: yieldsLoading, fetchYields } = useYields()

  // Fetch data on mount
  useEffect(() => {
    fetchExpenses()
    fetchYields()
  }, [fetchExpenses, fetchYields])

  const recentExpenses = useMemo(() => {
    if (!expenses) return []
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [expenses])

  const recentYields = useMemo(() => {
    if (!yields) return []
    return [...yields]
      .sort((a, b) => new Date(b.harvest_date) - new Date(a.harvest_date))
      .slice(0, 5)
  }, [yields])

  // Combine and sort all transactions
  const allTransactions = useMemo(() => {
    const transactions = []
    
    // Add expenses
    recentExpenses.forEach((expense) => {
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
    recentYields.forEach((yieldRecord) => {
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
    
    // Sort by date (newest first) and take top 10
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
  }, [recentExpenses, recentYields])

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
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar/Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-gray-200">
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

