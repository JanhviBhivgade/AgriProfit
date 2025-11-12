"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export function useYields() {
  const [yields, setYields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const ensureUser = useCallback(() => {
    if (!user) {
      throw new Error("User not authenticated")
    }
    return user
  }, [user])

  const fetchYields = useCallback(
    async (filters = {}) => {
      if (!user) {
        setYields([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { cropId, startDate, endDate } = filters

        let query = supabase
          .from("yields")
          .select(
            `
          *,
          crops (
            id,
            name
          )
        `
          )
          .eq("user_id", user.id)
          .order("harvest_date", { ascending: false })

        if (cropId) {
          query = query.eq("crop_id", cropId)
        }

        if (startDate) {
          query = query.gte("harvest_date", startDate)
        }

        if (endDate) {
          query = query.lte("harvest_date", endDate)
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw fetchError
        }

        setYields(data || [])
      } catch (err) {
        setError(err.message)
        console.error("Error fetching yields:", err)
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const createYield = useCallback(
    async (yieldData) => {
      try {
        setError(null)
        setLoading(true)

        const currentUser = ensureUser()

        const { data, error: createError } = await supabase
          .from("yields")
          .insert({
            ...yieldData,
            user_id: currentUser.id,
          })
          .select(
            `
          *,
          crops (
            id,
            name
          )
        `
          )
          .single()

        if (createError) {
          throw createError
        }

        setYields((prev) => [data, ...prev])
        return { data, error: null }
      } catch (err) {
        const errorMessage = err.message || "Failed to create yield"
        setError(errorMessage)
        return { data: null, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [ensureUser]
  )

  const updateYield = useCallback(
    async (id, yieldData) => {
      try {
        setError(null)
        setLoading(true)

        const currentUser = ensureUser()

        const { data, error: updateError } = await supabase
          .from("yields")
          .update(yieldData)
          .eq("id", id)
          .eq("user_id", currentUser.id)
          .select(
            `
          *,
          crops (
            id,
            name
          )
        `
          )
          .single()

        if (updateError) {
          throw updateError
        }

        setYields((prev) => prev.map((y) => (y.id === id ? data : y)))
        return { data, error: null }
      } catch (err) {
        const errorMessage = err.message || "Failed to update yield"
        setError(errorMessage)
        return { data: null, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [ensureUser]
  )

  const deleteYield = useCallback(
    async (id) => {
      try {
        setError(null)
        setLoading(true)

        const currentUser = ensureUser()

        const { error: deleteError } = await supabase
          .from("yields")
          .delete()
          .eq("id", id)
          .eq("user_id", currentUser.id)

        if (deleteError) {
          throw deleteError
        }

        setYields((prev) => prev.filter((y) => y.id !== id))
        return { error: null }
      } catch (err) {
        const errorMessage = err.message || "Failed to delete yield"
        setError(errorMessage)
        return { error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [ensureUser]
  )

  const totalRevenue = yields.reduce(
    (sum, y) => sum + parseFloat(y.total_revenue || 0),
    0
  )
  const totalQuantity = yields.reduce(
    (sum, y) => sum + parseFloat(y.quantity || 0),
    0
  )

  return {
    yields,
    loading,
    error,
    fetchYields,
    createYield,
    updateYield,
    deleteYield,
    totalRevenue,
    totalQuantity,
  }
}

