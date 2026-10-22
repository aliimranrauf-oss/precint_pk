import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureAgent } from "@/lib/agent";
import { formatPrice, Listing } from "@/lib/data";
import { approve, reject, assignLead } from "./actions";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const supabase = createClient();
  if (!supabase) redirect("/");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const agent = await ensureAgent(supabase, user);
  if (!agent?.is_admin) return <section><div className="wrap"><p className="note">Yeh page sirf admin ke liye hai.</p></div></section>;

  const { data: pending } = await supabase.from("listings").select("*").eq("status", "pending").order("created_at");
  const { data: reports } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50);

  const { data: unassigned } = await supabase.from("leads").select("*").is("agent_id", null).order("created_at", { ascending: false }).limit(50);
  const { data: agents } = await supabase.from("agents").select("id,name").order("name");

  return (
    <section><div className="wrap">
      <h1 className="h1">Admin</h1>
      <h2>Review ka intezar ({pending?.length ?? 0})</h2>
      <div className="list">
        {(pending as (Listing & { description?: string })[] | null)?.map((l) => (
          <div className="item" key={l.id}>
            <div>
              <b>{l.title}</b> · Precinct {l.precinct} · {formatPrice(l.price)}
              <div className="meta">Agent: {l.agent_name} · {l.phone}</div>
              {l.description && <div className="meta">{l.description}</div>}
              <div className="thumbs">{l.photos?.map((u) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={u} src={u} alt="" />)}</div>
              <div className="meta">Pehle agent ko call karke confirm karo, phir Approve dabao. Approve = Verified badge.</div>
            </div>
            <div className="btns">
              <form action={approve}><input type="hidden" name="id" value={l.id} /><button className="btn p">Approve</button></form>
              <form action={reject}><input type="hidden" name="id" value={l.id} /><button className="btn">Reject</button></form>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 28 }}>Unassigned leads ({unassigned?.length ?? 0})</h2>
      <p className="sub">Chatbot se aayi leads jin ka agent maloom nahi. Kisi agent ko assign karo.</p>
      <div className="list">
        {unassigned?.map((x: any) => (
          <div className="item" key={x.id}>
            <div><b>{x.name || "Naam nahi"}</b> · {x.phone}<div className="meta">Budget: {x.budget || "-"} · {x.note}</div></div>
            <form action={assignLead} className="btns">
              <input type="hidden" name="id" value={x.id} />
              <select name="agent_id" style={{ width: "auto" }}>{agents?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              <button className="btn p">Assign</button>
            </form>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 28 }}>Customer reports</h2>
      <p className="sub">3 reports par listing khud hide ho jati hai.</p>
      <div className="list">
        {reports?.map((r) => (
          <div className="item" key={r.id}>
            <div><Link href={`/listing/${r.listing_id}`}><u>{String(r.listing_id).slice(0, 8)}</u></Link> · {r.reason}
              <div className="meta">{new Date(r.created_at).toLocaleString("en-PK")}</div></div>
          </div>
        ))}
        {(!reports || reports.length === 0) && <p className="meta">Koi report nahi.</p>}
      </div>
    </div></section>
  );
}
