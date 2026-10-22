"use client";
import { useState } from "react";

type Msg = { from: "bot" | "me"; text: string };

// DEMO ONLY. Later: call /api/chat which talks to the Claude API and saves leads in Supabase.
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Assalam o Alaikum! Main Bahria Town Karachi ke plots, rates aur precincts ke baare mein madad kar sakta hoon. Aap kya dhoond rahe hain?" },
  ]);

  function send() {
    const v = text.trim();
    if (!v) return;
    setMsgs((m) => [...m, { from: "me", text: v }, { from: "bot", text: "Shukriya! Yeh demo chatbot hai. Asli version mein AI jawab dega aur aapka number agent ko bhejega." }]);
    setText("");
  }

  return (
    <>
      <div className={"chat" + (open ? " open" : "")}>
        <div className="ch">Precinct Assistant</div>
        <div className="cm">
          {msgs.map((m, i) => <div key={i} className={"m " + (m.from === "bot" ? "bot" : "me")}>{m.text}</div>)}
        </div>
        <div className="ci">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Yahan likhein…" />
          <button className="btn p" onClick={send}>Bhejein</button>
        </div>
      </div>
      <button className="fab" onClick={() => setOpen(!open)}>💬 Chat</button>
    </>
  );
}
