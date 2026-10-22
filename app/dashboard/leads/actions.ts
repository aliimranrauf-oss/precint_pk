"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["new", "contacted", "visit", "deal"];

export async function updateLeadStatus(formData: FormData) {
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status)) return;
  const supabase = createClient();
  if (!supabase) return;
  await supabase.from("leads").update({ status }).eq("id", String(formData.get("id"))); // RLS: only own leads
  revalidatePath("/dashboard/leads");
}
