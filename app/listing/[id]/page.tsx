import { notFound } from "next/navigation";
import { getListing, formatPrice, confirmedText } from "@/lib/data";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const l = await getListing(params.id);
  if (!l) notFound();
  const wa = `https://wa.me/${l.phone}?text=${encodeURIComponent(`Assalam o Alaikum, Precinct.pk par ${l.title} (Precinct ${l.precinct}) dekha. Kya abhi available hai?`)}`;
  return (
    <section><div className="wrap" style={{ maxWidth: 760 }}>
      <div className="ph big">{l.verified && <span className="badge">✔ Verified</span>}</div>
      <h1 className="h1" style={{ marginTop: 16 }}>{l.title}, Precinct {l.precinct}</h1>
      <div className="price">{formatPrice(l.price)}</div>
      <div className="conf">Confirmed: {confirmedText(l.confirmed_at)}</div>
      <p className="meta">{l.description ?? "Tafseel agent se poochein."}</p>
      <div className="row" style={{ maxWidth: 360 }}>
        <a className="btn" href={`tel:+${l.phone}`}>Call</a>
        <a className="btn p" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
      <p className="agent">Agent: {l.agent_name}</p>
      <p className="meta" style={{ marginTop: 20 }}>Rate ya availability alag nikli? <button className="btn">Report karein</button></p>
    </div></section>
  );
}
