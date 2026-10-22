import ListingCard from "@/components/ListingCard";
import SearchBox from "@/components/SearchBox";
import { getListings } from "@/lib/data";

export const metadata = { title: "Listings | Precinct.pk" };

export default async function Listings({ searchParams }: { searchParams: { precinct?: string; type?: string } }) {
  const listings = await getListings(searchParams);
  return (
    <section><div className="wrap">
      <h1 className="h1">Bahria Town Karachi listings</h1>
      <SearchBox />
      <div className="grid" style={{ marginTop: 20 }}>
        {listings.map((l) => <ListingCard key={l.id} l={l} />)}
      </div>
      {listings.length === 0 && <p className="meta">Koi listing nahi mili. Doosra precinct ya type try karein.</p>}
    </div></section>
  );
}
