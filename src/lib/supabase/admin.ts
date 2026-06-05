import { createClient } from '@supabase/supabase-js'

// Admin client to bypass RLS, ONLY use in server actions/api routes for background tasks
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
