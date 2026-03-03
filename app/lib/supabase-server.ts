import { createClient } from "@supabase/supabase-js";

function required(name: string, v?: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const supabaseAdmin = createClient(
  required("SUPABASE_URL", process.env.SUPABASE_URL),
  required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  {
    auth: { persistSession: false },
  }
);