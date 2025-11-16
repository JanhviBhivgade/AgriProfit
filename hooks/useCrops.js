"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export function useCrops() {
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Fetch crops
  const fetchCrops = useCallback(async () => {
    if (!user) {
      setCrops([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build query
      const { data, error: fetchError } = await supabase
        .from("crops")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setCrops(data || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching crops:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Create crop
  const createCrop = useCallback(async (cropData) => {
    try {
      setError(null)

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error: createError } = await supabase
        .from("crops")
        .insert({
          ...cropData,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      setCrops((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to create crop"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [user])

  // Update crop
  const updateCrop = useCallback(async (id, cropData) => {
    try {
      setError(null)

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error: updateError } = await supabase
        .from("crops")
        .update(cropData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      setCrops((prev) =>
        prev
          .map((crop) => (crop.id === id ? data : crop))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to update crop"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [user])

  // Delete crop
  const deleteCrop = useCallback(async (id) => {
    try {
      setError(null)

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error: deleteError } = await supabase
        .from("crops")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (deleteError) {
        throw deleteError
      }

      setCrops((prev) => prev.filter((crop) => crop.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to delete crop"
      setError(errorMessage)
      return { error: errorMessage }
    }
  }, [user])

  useEffect(() => {
    fetchCrops()
  }, [fetchCrops])

  return {
    crops,
    loading,
    error,
    fetchCrops,
    createCrop,
    updateCrop,
    deleteCrop,
  }
}

