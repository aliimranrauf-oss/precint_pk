"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function guard() {
  const supabase = createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("agents").select("is_admin").eq("id", user.id).maybeSingle();
  return data?.is_admin ? supabase : null; // RLS also blocks non-admins
}

export async function approve(formData: FormData) {
  const supabase = await guard();
  if (!supabase) return;
  await supabase.from("listings")
    .update({ status: "active", verified: true, confirmed_at: new Date().toISOString() })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin");
}

export async function reject(formData: FormData) {
  const supabase = await guard();
  if (!supabase) return;
  await supabase.from("listings").update({ status: "hidden", verified: false }).eq("id", String(formData.get("id")));
  revalidatePath("/admin");
}

export async function assignLead(formData: FormData) {
  const supabase = await guard();
  if (!supabase) return;
  await supabase.from("leads").update({ agent_id: String(formData.get("agent_id")) }).eq("id", String(formData.get("id")));
  revalidatePath("/admin");
}
