import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Agent = {
  id: string;
  name: string;
  phone: string;
  office_address: string | null;
  verified: boolean;
  is_admin: boolean;
  score: number;
};

// 0300-1234567 / +92 300 1234567 -> 923001234567
export function normalizePhone(raw: string) {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  return d;
}

// Makes sure the logged-in user has a row in `agents` (created from signup details)
export async function ensureAgent(supabase: SupabaseClient, user: User): Promise<Agent | null> {
  const { data } = await supabase.from("agents").select("*").eq("id", user.id).maybeSingle();
  if (data) return data as Agent;
  const meta = (user.user_metadata || {}) as { name?: string; phone?: string };
  const { data: created } = await supabase
    .from("agents")
    .insert({ id: user.id, name: meta.name || user.email || "Agent", phone: normalizePhone(meta.phone || "") })
    .select("*")
    .single();
  return (created as Agent) ?? null;
}
