import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import ListingCard from "@/components/ListingCard";
import { getListings, PRECINCTS } from "@/lib/data";

const RATES: [string, string, string, boolean][] = [
  ["10A", "1.45 cr", "+2.1%", true],
  ["11B", "1.30 cr", "+1.4%", true],
  ["27", "1.10 cr", "+3.0%", true],
  ["31", "95 lakh", "-0.5%", false],
];

export default async function Home() {
  const listings = (await getListings()).slice(0, 6);
  return (
    <>
      <div className="hero"><div className="wrap">
        <h1>Bahria Town Karachi ke plots, ghar aur kiraye</h1>
        <p>Verified listings. Asli rate. Roman Urdu mein madad.</p>
        <SearchBox />
      </div></div>

      <section><div className="wrap">
        <h2>Precinct chuno</h2>
        <div className="chips">
          {PRECINCTS.map((p) => <Link key={p} href={`/${p.toLowerCase()}`} className="chip">Precinct {p}</Link>)}
        </div>
      </div></section>

      <section style={{ paddingTop: 0 }}><div className="wrap">
        <h2>Verified Listings</h2>
        <p className="sub">Abhi sample data hai. Supabase jorne ke baad asli listings aayengi.</p>
        <div className="grid">{listings.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        <p style={{ marginTop: 16 }}><Link href="/listings" className="btn">Sari listings dekhein</Link></p>
      </div></section>

      <section id="rates"><div className="wrap split">
        <div className="panel">
          <h2>Aaj ke Rates (250 gaz plot)</h2>
          <p className="sub">Sample numbers</p>
          {RATES.map((r) => (
            <div className="rate" key={r[0]}>
              <span>Precinct {r[0]}</span>
              <span>Rs. {r[1]} <span className={r[3] ? "up" : "dn"}>{r[2]}</span></span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Rate trend</h2>
          <p className="sub">Precinct 10A, 6 mahine (sample)</p>
          <svg viewBox="0 0 300 130" width="100%" role="img" aria-label="Rate trend chart">
            <polyline fill="none" stroke="var(--brand)" strokeWidth="3" points="10,100 60,92 110,95 160,70 210,58 290,35" />
            <g fill="var(--accent)">
              {[[10,100],[60,92],[110,95],[160,70],[210,58],[290,35]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" />)}
            </g>
            <g fill="var(--muted)" fontSize="10">
              {["May","Jun","Jul","Aug","Sep","Oct"].map((m, i) => <text key={m} x={[4,55,105,155,205,270][i]} y="122">{m}</text>)}
            </g>
          </svg>
        </div>
      </div></section>

      <section id="why"><div className="wrap">
        <h2>Kyun Precinct.pk?</h2>
        <div className="why">
          <div className="w"><b>✔ Verified</b><span>Taaza video, documents aur rate check ke baad hi badge milta hai.</span></div>
          <div className="w"><b>⏱ Taaza listings</b><span>Har listing par “aakhri baar confirm” likha hota hai. Bik gayi to hat jati hai.</span></div>
          <div className="w"><b>💬 Roman Urdu AI</b><span>Rate, payment plan aur precinct ke sawal apni zubaan mein poochein.</span></div>
          <div className="w"><b>🌍 Overseas support</b><span>Video tour aur WhatsApp par bharosay wale agents.</span></div>
        </div>
      </div></section>

      <section id="agents"><div className="wrap">
        <div className="cta">
          <h2>Property agent ho?</h2>
          <div>Asli leads lein, CRM mein hisaab rakhein, aur Verified badge se bharosa banayein.</div>
          <button className="btn">Agent account banayein</button>
        </div>
      </div></section>
    </>
  );
}
