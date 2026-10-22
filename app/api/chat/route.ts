import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase } from "@/lib/supabase";
import { getListings, getListing, formatPrice, confirmedText, Listing } from "@/lib/data";
import { buildSystemPrompt } from "@/lib/chatPrompt";
import { normalizePhone } from "@/lib/agent";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PER_IP_LIMIT = Number(process.env.CHAT_PER_IP_DAILY || 40);
const GLOBAL_LIMIT = Number(process.env.CHAT_GLOBAL_DAILY || 3000);

const line = (l: Listing) =>
  `- id=${l.id} | Precinct ${l.precinct} | ${l.type} | ${l.title} | ${formatPrice(l.price)} | confirmed ${confirmedText(l.confirmed_at)} | agent ${l.agent_name}`;

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const msgs: { role: "user" | "model"; text: string }[] = Array.isArray(body?.messages)
    ? body.messages
        .filter((m: any) => m && (m.role === "user" || m.role === "model") && typeof m.text === "string")
        .slice(-16)
        .map((m: any) => ({ role: m.role, text: String(m.text).slice(0, 500) }))
    : [];
  if (msgs.length === 0 || msgs[msgs.length - 1].role !== "user") {
    return NextResponse.json({ error: "no message" }, { status: 400 });
  }
  const listingId: string | null = typeof body?.listingId === "string" && UUID.test(body.listingId) ? body.listingId : null;

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ reply: "Chatbot abhi setup ho raha hai. Filhal listing par Call ya WhatsApp se agent se baat karein." });
  }

  // cost control: per-visitor and global daily limits (needs phase3.sql; if missing we do not block)
  if (supabase) {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const ipHash = createHash("sha256").update(ip + (process.env.CHAT_SALT || "precinct")).digest("hex").slice(0, 32);
    const a = await supabase.rpc("bump_chat_usage", { p_ip: ipHash, p_limit: PER_IP_LIMIT });
    const g = await supabase.rpc("bump_chat_usage", { p_ip: "GLOBAL", p_limit: GLOBAL_LIMIT });
    if (a.data === false || g.data === false) {
      return NextResponse.json({ reply: "Aaj ki chat limit poori ho gayi. Meherbani karke listing par Call ya WhatsApp se agent se baat karein." });
    }
  }

  const all = (await getListings()).slice(0, 25);
  const focus = listingId ? await getListing(listingId) : null;
  const system = buildSystemPrompt(all.map(line), focus ? line(focus) : null);

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  let out: { reply?: string; lead?: any } = {};
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: msgs.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              reply: { type: "STRING" },
              lead: {
                type: "OBJECT",
                nullable: true,
                properties: { name: { type: "STRING" }, phone: { type: "STRING" }, budget: { type: "STRING" }, note: { type: "STRING" } },
              },
            },
            required: ["reply"],
          },
        },
      }),
    });
    if (!r.ok) throw new Error("gemini " + r.status);
    const j = await r.json();
    out = JSON.parse(j?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
  } catch {
    return NextResponse.json({ reply: "Maaf kijiye, abhi jawab nahi de pa raha. Thori der baad try karein, ya agent ko seedha call karein." });
  } finally {
    clearTimeout(timer);
  }

  // save lead (only through the safe SQL function)
  if (supabase && out.lead && typeof out.lead.phone === "string") {
    const phone = normalizePhone(out.lead.phone);
    if (phone.length >= 10) {
      const transcript = msgs.map((m) => `${m.role === "user" ? "Customer" : "Bot"}: ${m.text}`).join("\n");
      await supabase.rpc("submit_lead", {
        p_listing: listingId,
        p_name: String(out.lead.name || ""),
        p_phone: phone,
        p_budget: String(out.lead.budget || ""),
        p_note: String(out.lead.note || ""),
        p_transcript: transcript,
      });
    }
  }

  return NextResponse.json({ reply: String(out.reply || "Ji, bataiye main kaise madad kar sakta hoon?").slice(0, 1200) });
}
