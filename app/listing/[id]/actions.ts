"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function reportListing(formData: FormData) {
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "");
  const supabase = createClient();
  if (supabase && ["not_available", "rate_different"].includes(reason)) {
    await supabase.from("reports").insert({ listing_id: id, reason }); // ignored for sample ids
  }
  redirect(`/listing/${id}?reported=1`);
}
