"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "@/app/dashboard/actions";
import { PRECINCTS } from "@/lib/data";

// Shrinks a photo to max 1280px JPEG (~200KB) so free storage lasts long
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("compress"))), "image/jpeg", 0.8));
}

export default function NewListingForm() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const files = (fd.getAll("photos") as File[]).filter((f) => f.size > 0 && f.type.startsWith("image/")).slice(0, 4);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Dobara login karein.");
      const urls: string[] = [];
      for (const f of files) {
        const blob = await compress(f);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from("listing-photos").upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw new Error("Photo upload fail: " + error.message);
        urls.push(supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl);
      }
      fd.delete("photos");
      fd.append("photos", JSON.stringify(urls));
      const r = await createListing(fd);
      if (r && r.error) setErr(r.error);
    } catch (ex: any) {
      if (ex?.digest?.startsWith?.("NEXT_REDIRECT")) throw ex;
      setErr(ex?.message || "Kuch ghalat hua.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="form">
      <label>Precinct
        <select name="precinct" required defaultValue="">
          <option value="" disabled>Chuno</option>
          {PRECINCTS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </label>
      <label>Type
        <select name="type" required defaultValue="">
          <option value="" disabled>Chuno</option>
          <option>Plot</option><option>Ghar</option><option>Flat</option><option>File</option>
        </select>
      </label>
      <label>Title (jaise: Plot 250 gaz)<input name="title" required maxLength={120} /></label>
      <label>Price (Rs., sirf number)<input name="price" type="number" min={1} required inputMode="numeric" placeholder="14500000" /></label>
      <label>Tafseel<textarea name="description" rows={4} maxLength={2000} /></label>
      <label>Photos (max 4)<input name="photos" type="file" accept="image/*" multiple /></label>
      <p className="meta">Listing pehle “Review mein” jati hai. Sahi rate aur asli photos daalein, sasta jhoota rate daalne par account band ho sakta hai.</p>
      {err && <p className="note">{err}</p>}
      <button className="btn p" disabled={busy}>{busy ? "Upload ho raha hai…" : "Listing bhejein"}</button>
    </form>
  );
}
