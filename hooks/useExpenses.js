"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Fetch expenses
  const fetchExpenses = useCallback(async (filters = {}) => {
    if (!user) {
      setExpenses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const {
        category,
        startDate,
        endDate,
        cropId,
      } = filters

      // Get current user
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Build query
      let query = supabase
        .from("expenses")
        .select(`
          *,
          crops (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      // Apply filters
      if (category) {
        query = query.eq("category", category)
      }

      if (startDate) {
        query = query.gte("date", startDate)
      }

      if (endDate) {
        query = query.lte("date", endDate)
      }

      if (cropId) {
        query = query.eq("crop_id", cropId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setExpenses(data || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching expenses:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Create expense
  const createExpense = useCallback(async (expenseData) => {
    try {
      setError(null)
      setLoading(true)

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error: createError } = await supabase
        .from("expenses")
        .insert({
          ...expenseData,
          user_id: user.id,
        })
        .select(`
          *,
          crops (
            id,
            name
          )
        `)
        .single()

      if (createError) {
        throw createError
      }

      setExpenses((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to create expense"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Update expense
  const updateExpense = useCallback(async (id, expenseData) => {
    try {
      setError(null)
      setLoading(true)

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error: updateError } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select(`
          *,
          crops (
            id,
            name
          )
        `)
        .single()

      if (updateError) {
        throw updateError
      }

      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? data : exp))
      )
      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to update expense"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Delete expense
  const deleteExpense = useCallback(async (id) => {
    try {
      setError(null)
      setLoading(true)

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (deleteError) {
        throw deleteError
      }

      setExpenses((prev) => prev.filter((exp) => exp.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to delete expense"
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    totalExpenses,
  }
}

