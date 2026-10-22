"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureAgent } from "@/lib/agent";
import { PRECINCTS } from "@/lib/data";

const TYPES = ["Plot", "Ghar", "Flat", "File"];

export async function createListing(formData: FormData): Promise<{ error: string } | void> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase set nahi hai." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const agent = await ensureAgent(supabase, user);
  if (!agent || !agent.phone) return { error: "Profile mein phone number nahi hai." };

  const precinct = String(formData.get("precinct") || "");
  const type = String(formData.get("type") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 120);
  const description = String(formData.get("description") || "").trim().slice(0, 2000);
  const price = Number(formData.get("price"));
  if (!PRECINCTS.includes(precinct) || !TYPES.includes(type) || !title || !(price > 0)) {
    return { error: "Precinct, type, title aur price sahi daalein." };
  }

  // Only accept photo URLs from OUR storage bucket, inside this agent's own folder
  let photos: string[] = [];
  try { photos = JSON.parse(String(formData.get("photos") || "[]")); } catch {}
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${user.id}/`;
  photos = photos.filter((u) => typeof u === "string" && u.startsWith(prefix)).slice(0, 4);

  const { error } = await supabase.from("listings").insert({
    agent_id: user.id,
    agent_name: agent.name,
    phone: agent.phone,
    precinct, type, title, description, price, photos,
    status: "pending",
  });
  if (error) return { error: "Save nahi hui: " + error.message };
  revalidatePath("/dashboard");
  redirect("/dashboard?added=1");
}

export async function markSold(formData: FormData) {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.from("listings").update({ status: "sold" }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard");
}

export async function confirmAvailable(formData: FormData) {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.from("listings").update({ confirmed_at: new Date().toISOString() }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard");
}
