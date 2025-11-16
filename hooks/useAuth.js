"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  const fetchOrCreateProfile = useCallback(async (supabaseUser) => {
    if (!supabaseUser) return null

    try {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      if (data) {
        return data
      }

      const defaultProfile = {
        id: supabaseUser.id,
        full_name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.email?.split("@")[0] ||
          "",
        farm_name: supabaseUser.user_metadata?.farm_name || "",
      }

      const { data: createdProfile, error: insertError } = await supabase
        .from("profiles")
        .insert(defaultProfile)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return createdProfile
    } catch (err) {
      console.error("Error fetching or creating profile:", err)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialise = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          setLoading(false)
          fetchOrCreateProfile(session.user).then((profileData) => {
            if (isMounted) {
              setProfile(profileData)
            }
          })
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error initialising auth session:", err)
          setError(err.message || "Failed to initialise session")
          setLoading(false)
        }
      }
    }

    initialise()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        fetchOrCreateProfile(session.user).then((profileData) => {
          if (isMounted) {
            setProfile(profileData)
          }
        })
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchOrCreateProfile])

  const signUp = useCallback(async (email, password, fullName, farmName) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            farm_name: farmName,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          farm_name: farmName,
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)
        }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to sign up"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (data.user) {
        setUser(data.user)
        setLoading(false)
        fetchOrCreateProfile(data.user).then((userProfile) => {
          setProfile(userProfile)
        })
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to sign in"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [fetchOrCreateProfile])

  const signOut = useCallback(async () => {
    try {
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        throw signOutError
      }

      setUser(null)
      setProfile(null)
      router.push("/auth/login")
      return { error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to sign out"
      setError(errorMessage)
      return { error: errorMessage }
    }
  }, [router])

  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      setError(null)
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message || "Failed to update profile"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isAuthenticated: !!user,
    }),
    [user, profile, loading, error, signUp, signIn, signOut, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

