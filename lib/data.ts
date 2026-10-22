import { supabase } from "./supabase";

export const PRECINCTS = ["10A", "11B", "27", "31"];

export type Listing = {
  id: string;
  precinct: string;
  title: string;
  type: string;
  price: number; // PKR
  agent_name: string;
  phone: string; // international format without +, e.g. 923001234567
  confirmed_at: string; // ISO date
  verified: boolean;
  description?: string;
  photos?: string[];
  agent_id?: string;
};

export const EXPIRY_DAYS = 14;

const SAMPLE: Listing[] = [
  { id: "1", precinct: "10A", title: "Plot 250 gaz", type: "Plot", price: 14500000, agent_name: "Ali Estate", phone: "923001234567", confirmed_at: daysAgo(2), verified: true },
  { id: "2", precinct: "27", title: "Ghar 5 marla", type: "Ghar", price: 21000000, agent_name: "Usman Associates", phone: "923001234567", confirmed_at: daysAgo(0), verified: true },
  { id: "3", precinct: "11B", title: "Flat 2 bed", type: "Flat", price: 8500000, agent_name: "Hassan Realtors", phone: "923001234567", confirmed_at: daysAgo(1), verified: true },
  { id: "4", precinct: "31", title: "Plot 125 gaz", type: "Plot", price: 6200000, agent_name: "Ali Estate", phone: "923001234567", confirmed_at: daysAgo(3), verified: true },
  { id: "5", precinct: "10A", title: "Ghar 500 gaz", type: "Ghar", price: 48000000, agent_name: "Usman Associates", phone: "923001234567", confirmed_at: daysAgo(0), verified: true },
  { id: "6", precinct: "27", title: "Plot 250 gaz", type: "Plot", price: 11000000, agent_name: "Hassan Realtors", phone: "923001234567", confirmed_at: daysAgo(2), verified: true },
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

export async function getListings(filter: { precinct?: string; type?: string } = {}): Promise<Listing[]> {
  let rows: Listing[] = SAMPLE;
  if (supabase) {
    try {
      let q = supabase.from("listings").select("*").eq("status", "active").gte("confirmed_at", new Date(Date.now() - EXPIRY_DAYS * 86400000).toISOString()).order("created_at", { ascending: false });
      if (filter.precinct) q = q.eq("precinct", filter.precinct);
      if (filter.type) q = q.eq("type", filter.type);
      const { data, error } = await q;
      if (!error && data) return data as Listing[];
    } catch {}
  }
  return rows.filter(
    (l) => (!filter.precinct || l.precinct === filter.precinct) && (!filter.type || l.type === filter.type)
  );
}

export async function getListing(id: string): Promise<Listing | null> {
  if (supabase) {
    try {
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      if (data) return data as Listing;
    } catch {}
  }
  return SAMPLE.find((l) => l.id === id) ?? null;
}

export function formatPrice(n: number) {
  if (n >= 10000000) return `Rs. ${+(n / 10000000).toFixed(2)} crore`;
  if (n >= 100000) return `Rs. ${+(n / 100000).toFixed(1)} lakh`;
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export function confirmedText(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Aaj";
  if (d === 1) return "1 din pehle";
  return `${d} din pehle`;
}
