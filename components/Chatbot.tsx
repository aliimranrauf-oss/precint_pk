"use client";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { from: "bot" | "me"; text: string };
const GREETING = "Assalam o Alaikum! Main Bahria Town Karachi ke plots, ghar aur kiraye mein madad kar sakta hoon. Aap kya dhoond rahe hain?";
const MAX_USER_MSGS = 20;

function linkify(text: string) {
  return text.split(/(\/listing\/[\w-]+)/g).map((p, i) =>
    /^\/listing\//.test(p) ? <a key={i} href={p}><u>Listing dekhein</u></a> : <span key={i}>{p}</span>
  );
}

export default function Chatbot() {
  const pathname = usePathname();
  const listingId = pathname.startsWith("/listing/") ? pathname.split("/")[2] : null;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: GREETING }]);
  const box = useRef<HTMLDivElement>(null);
  const used = msgs.filter((m) => m.from === "me").length;

  async function send() {
    const v = text.trim();
    if (!v || busy || used >= MAX_USER_MSGS) return;
    const next = [...msgs, { from: "me" as const, text: v }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const history = next.slice(1).map((m) => ({ role: m.from === "me" ? "user" : "model", text: m.text }));
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, listingId }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { from: "bot", text: j.reply || "Maaf kijiye, dobara try karein." }]);
    } catch {
      setMsgs((m) => [...m, { from: "bot", text: "Internet masla lag raha hai. Dobara try karein." }]);
    }
    setBusy(false);
    setTimeout(() => box.current?.scrollTo({ top: 99999 }), 50);
  }

  return (
    <>
      <div className={"chat" + (open ? " open" : "")}>
        <div className="ch">Precinct Assistant</div>
        <div className="cm" ref={box}>
          {msgs.map((m, i) => <div key={i} className={"m " + (m.from === "bot" ? "bot" : "me")}>{m.from === "bot" ? linkify(m.text) : m.text}</div>)}
          {busy && <div className="m bot">…</div>}
        </div>
        <div className="ci">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={used >= MAX_USER_MSGS ? "Chat limit poori" : "Yahan likhein…"} maxLength={500} />
          <button className="btn p" onClick={send} disabled={busy}>Bhejein</button>
        </div>
      </div>
      <button className="fab" onClick={() => setOpen(!open)}>💬 Chat</button>
    </>
  );
}
