import { notFound } from "next/navigation";
import { getListing, formatPrice, confirmedText } from "@/lib/data";
import { reportListing } from "./actions";

export default async function ListingPage({ params, searchParams }: { params: { id: string }; searchParams: { reported?: string } }) {
  const l = await getListing(params.id);
  if (!l) notFound();
  const wa = `https://wa.me/${l.phone}?text=${encodeURIComponent(`Assalam o Alaikum, Precinct.pk par ${l.title} (Precinct ${l.precinct}) dekha. Kya abhi available hai?`)}`;
  return (
    <section><div className="wrap" style={{ maxWidth: 760 }}>
      {l.photos && l.photos.length > 0 ? (
        <div className="gallery">{l.photos.map((u) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={u} src={u} alt={l.title} />)}</div>
      ) : (
        <div className="ph big">{l.verified && <span className="badge">✔ Verified</span>}</div>
      )}
      <h1 className="h1" style={{ marginTop: 16 }}>{l.title}, Precinct {l.precinct} {l.verified && <span className="vtag">✔ Verified</span>}</h1>
      <div className="price">{formatPrice(l.price)}</div>
      <div className="conf">Confirmed: {confirmedText(l.confirmed_at)}</div>
      <p className="meta">{l.description || "Tafseel agent se poochein."}</p>
      <div className="row" style={{ maxWidth: 360 }}>
        <a className="btn" href={`tel:+${l.phone}`}>Call</a>
        <a className="btn p" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
      <p className="agent">Agent: {l.agent_name}</p>

      <div className="panel" style={{ marginTop: 24 }}>
        {searchParams.reported ? (
          <p className="meta">Shukriya, aapki report mil gayi. Hum check karenge.</p>
        ) : (
          <form action={reportListing} className="row" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <input type="hidden" name="id" value={l.id} />
            <span className="meta">Rate ya availability alag nikli?</span>
            <select name="reason" style={{ width: "auto" }}>
              <option value="not_available">Available nahi tha</option>
              <option value="rate_different">Rate alag tha</option>
            </select>
            <button className="btn">Report karein</button>
          </form>
        )}
      </div>
    </div></section>
  );
}
