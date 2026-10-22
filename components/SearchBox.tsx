"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRECINCTS } from "@/lib/data";

const MODES = ["Buy", "Rent", "Invest"];

export default function SearchBox() {
  const router = useRouter();
  const [mode, setMode] = useState("Buy");
  const [precinct, setPrecinct] = useState("");
  const [type, setType] = useState("");

  function go() {
    const p = new URLSearchParams();
    if (precinct) p.set("precinct", precinct);
    if (type) p.set("type", type);
    router.push(`/listings?${p.toString()}`);
  }

  return (
    <div className="box">
      <div className="tabs">
        {MODES.map((m) => (
          <button key={m} className={"tab" + (m === mode ? " on" : "")} onClick={() => setMode(m)}>{m}</button>
        ))}
      </div>
      <div className="fields">
        <select value={precinct} onChange={(e) => setPrecinct(e.target.value)} aria-label="Precinct">
          <option value="">Precinct (sab)</option>
          {PRECINCTS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="">Type (sab)</option>
          <option>Plot</option><option>Ghar</option><option>Flat</option><option>File</option>
        </select>
        <select aria-label="Budget">
          <option>Budget (sab)</option>
          <option>50 lakh tak</option><option>50 lakh – 1 crore</option><option>1 – 2 crore</option><option>2 crore+</option>
        </select>
        <button className="go" onClick={go}>Search</button>
      </div>
    </div>
  );
}
