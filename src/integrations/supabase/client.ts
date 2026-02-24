import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// Public keys — safe to include as fallbacks. Env vars override at runtime.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yikldxgjdaqzjjmaudmr.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpa2xkeGdqZGFxempqbWF1ZG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA4OTgsImV4cCI6MjA3NTY3Njg5OH0.z033sqqi97PP_BMYrEG1M9XVj3Lk8QDN0k6zyLv26h4"

export const createClient = () => {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}

// Global instance for legacy components
export const supabase = createClient()
