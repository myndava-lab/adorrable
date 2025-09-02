
import { createClient } from "@supabase/supabase-js";

// Service role client for admin/cron tasks (server-only)
export const supaService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // keep ONLY on server
  { auth: { persistSession: false } }
);
