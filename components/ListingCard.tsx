import Link from "next/link";
import { Listing, formatPrice, confirmedText } from "@/lib/data";

export default function ListingCard({ l }: { l: Listing }) {
  const tone = ["", "b", "c"][Number(l.id.replace(/\D/g, "").slice(0, 3) || 0) % 3];
  const photo = l.photos?.[0];
  return (
    <div className="card">
      <Link href={`/listing/${l.id}`}>
        <div className={"ph " + tone}>
          {photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt={l.title} loading="lazy" />}
          {l.verified && <span className="badge">✔ Verified</span>}
        </div>
      </Link>
      <div className="cb">
        <div className="price">{formatPrice(l.price)}</div>
        <div className="meta">{l.title} · Precinct {l.precinct}</div>
        <div className="conf">Confirmed: {confirmedText(l.confirmed_at)}</div>
        <div className="row">
          <a className="btn" href={`tel:+${l.phone}`}>Call</a>
          <a className="btn p" href={`https://wa.me/${l.phone}?text=${encodeURIComponent(`Assalam o Alaikum, Precinct.pk par ${l.title} (Precinct ${l.precinct}) dekha. Kya abhi available hai?`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
        <div className="agent">Agent: {l.agent_name}</div>
      </div>
    </div>
  );
}
