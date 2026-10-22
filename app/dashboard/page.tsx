import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureAgent } from "@/lib/agent";
import { formatPrice, confirmedText, EXPIRY_DAYS, Listing } from "@/lib/data";
import { markSold, confirmAvailable } from "./actions";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { pending: "Review mein", active: "Live", sold: "Sold", hidden: "Hidden" };

export default async function Dashboard({ searchParams }: { searchParams: { added?: string } }) {
  const supabase = createClient();
  if (!supabase) return <section><div className="wrap"><p className="note">Supabase keys set nahi hain. README dekho.</p></div></section>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const agent = await ensureAgent(supabase, user);
  const { data } = await supabase.from("listings").select("*").eq("agent_id", user.id).order("created_at", { ascending: false });
  const listings = (data ?? []) as (Listing & { status: string })[];
  const stale = (iso: string) => Date.now() - new Date(iso).getTime() > EXPIRY_DAYS * 86400000;

  return (
    <section><div className="wrap">
      <div className="dhead">
        <div>
          <h1 className="h1" style={{ marginBottom: 4 }}>Dashboard</h1>
          <div className="meta">{agent?.name} · {agent?.verified ? "✔ Verified agent" : "Agent verification baqi"}</div>
        </div>
        <div className="btns">
          <Link href="/dashboard/new" className="btn p">+ Nayi listing</Link>
          {agent?.is_admin && <Link href="/admin" className="btn">Admin</Link>}
          <form action="/auth/signout" method="post"><button className="btn">Logout</button></form>
        </div>
      </div>
      {searchParams.added && <p className="note">Listing save ho gayi. Review ke baad live hogi.</p>}
      <p className="sub">Har {EXPIRY_DAYS} din mein “Still available” dabayein, warna listing public site se hat jati hai.</p>

      {listings.length === 0 && <p className="meta">Abhi koi listing nahi. “Nayi listing” dabayein.</p>}
      <div className="list">
        {listings.map((l) => (
          <div className="item" key={l.id}>
            <div>
              <b>{l.title}</b> · Precinct {l.precinct} · {formatPrice(l.price)}
              <div className="meta">
                <span className={"pill " + l.status}>{LABEL[l.status] ?? l.status}</span>{" "}
                Confirmed: {confirmedText(l.confirmed_at)}
                {l.status === "active" && stale(l.confirmed_at) && <b className="dn"> · Expire ho gayi</b>}
              </div>
            </div>
            {(l.status === "active" || l.status === "pending") && (
              <div className="btns">
                <form action={confirmAvailable}><input type="hidden" name="id" value={l.id} /><button className="btn">Still available</button></form>
                <form action={markSold}><input type="hidden" name="id" value={l.id} /><button className="btn">Sold</button></form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div></section>
  );
}
