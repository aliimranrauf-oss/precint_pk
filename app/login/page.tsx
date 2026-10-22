"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [signup, setSignup] = useState(sp.get("mode") === "signup");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return setMsg("Supabase keys set nahi hain (.env.local ya Vercel Environment Variables).");
    setBusy(true);
    setMsg("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    const supabase = createClient();
    if (signup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: String(f.get("name")), phone: String(f.get("phone")) } },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Account ban gaya. Email check karke confirm karo, phir login karo.");
      else { router.push("/dashboard"); router.refresh(); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else { router.push(sp.get("next") || "/dashboard"); router.refresh(); }
    }
    setBusy(false);
  }

  return (
    <div className="formbox">
      <h1 className="h1">{signup ? "Agent account banayein" : "Login"}</h1>
      <form onSubmit={submit} className="form">
        {signup && (
          <>
            <label>Naam / Dealership<input name="name" required /></label>
            <label>Phone (WhatsApp wala)<input name="phone" required placeholder="0300 1234567" inputMode="tel" /></label>
          </>
        )}
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required minLength={6} /></label>
        <button className="btn p" disabled={busy}>{busy ? "Intezar…" : signup ? "Account banayein" : "Login"}</button>
      </form>
      {msg && <p className="note">{msg}</p>}
      <p className="meta">
        {signup ? "Pehle se account hai?" : "Naya agent?"}{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); setSignup(!signup); setMsg(""); }}><u>{signup ? "Login" : "Account banayein"}</u></a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <section><div className="wrap"><Suspense><LoginForm /></Suspense></div></section>
  );
}
