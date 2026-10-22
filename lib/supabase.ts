import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null when env vars are missing, so the site still runs with sample data
export const supabase = url && key ? createClient(url, key) : null;
