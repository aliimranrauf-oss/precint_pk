import { notFound } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import { getListings, PRECINCTS } from "@/lib/data";

export function generateStaticParams() {
  return PRECINCTS.map((p) => ({ precinct: p.toLowerCase() }));
}

export default async function PrecinctPage({ params }: { params: { precinct: string } }) {
  const p = PRECINCTS.find((x) => x.toLowerCase() === params.precinct.toLowerCase());
  if (!p) notFound();
  const listings = await getListings({ precinct: p });
  return (
    <section><div className="wrap">
      <h1 className="h1">Bahria Town Karachi, Precinct {p}</h1>
      <p className="sub">Is precinct ki verified listings.</p>
      <div className="grid">{listings.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      {listings.length === 0 && <p className="meta">Abhi koi listing nahi.</p>}
    </div></section>
  );
}
