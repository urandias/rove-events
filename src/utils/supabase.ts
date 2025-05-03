import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const supabaseUrl =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ??
  import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) ??
  import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)