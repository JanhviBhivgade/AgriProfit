import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Server-side Supabase client for API routes
export async function createServerClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      getSession: async () => {
        const accessToken = cookieStore.get('sb-access-token')?.value
        const refreshToken = cookieStore.get('sb-refresh-token')?.value
        
        if (!accessToken) return { data: { session: null }, error: null }
        
        // Verify and get session
        const { data, error } = await createClient(supabaseUrl, supabaseAnonKey).auth.getSession()
        return { data, error }
      },
    },
  })
}

