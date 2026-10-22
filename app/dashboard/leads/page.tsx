import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus } from "./actions";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { new: "Nayi", contacted: "Rabta hua", visit: "Visit", deal: "Deal" };

export default async function Leads() {
  const supabase = createClient();
  if (!supabase) redirect("/");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("leads").select("*").eq("agent_id", user.id).order("created_at", { ascending: false });
  const leads = data ?? [];

  return (
    <section><div className="wrap">
      <div className="dhead">
        <h1 className="h1">Leads ({leads.length})</h1>
        <Link href="/dashboard" className="btn">← Dashboard</Link>
      </div>
      <p className="sub">Chatbot se aayi leads. Jaldi call karein, pehle rabta karne wale ko deal milti hai.</p>
      {leads.length === 0 && <p className="meta">Abhi koi lead nahi. Jab customer chatbot mein apna number dega, yahan nazar aayegi.</p>}
      <div className="list">
        {leads.map((l: any) => (
          <div className="item" key={l.id}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <b>{l.name || "Naam nahi diya"}</b> · {l.phone}
              <div className="meta">Budget: {l.budget || "-"}</div>
              {l.note && <div className="meta">Zaroorat: {l.note}</div>}
              {l.listing_id && <div className="meta"><Link href={`/listing/${l.listing_id}`}><u>Listing dekhein</u></Link></div>}
              <div className="meta">{new Date(l.created_at).toLocaleString("en-PK")}</div>
              {l.transcript && (
                <details><summary className="meta" style={{ cursor: "pointer" }}>Chat dekhein</summary>
                  <pre className="chatlog">{l.transcript}</pre></details>
              )}
            </div>
            <div className="btns" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
              <a className="btn" href={`tel:+${l.phone}`}>Call</a>
              <a className="btn p" href={`https://wa.me/${l.phone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <form action={updateLeadStatus} className="btns">
                <input type="hidden" name="id" value={l.id} />
                <select name="status" defaultValue={l.status} style={{ width: "auto" }}>
                  {Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button className="btn">Save</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div></section>
  );
}
