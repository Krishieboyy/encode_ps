import { useState } from "react";
import { chat } from "../lib/api";

export default function ChatBox({ analysisState }) {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");
  const [actions, setActions] = useState([]);

  async function send() {
    if (!msg.trim()) return;
    const res = await chat({ message: msg, analysis_state: analysisState });
    setReply(res.reply);
    setActions(res.suggested_actions || []);
  }

  return (
    <div className="card">
      <div style={{ fontSize: 16, fontWeight: 900 }}>Ask follow-ups</div>
      <div className="muted">Try: “okay daily?”, “why?”, “allergens?”, “sugar?”</div>

      <div className="hr" />

      <div className="row">
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Type a question..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
        />
        <button className="btn" onClick={send}>Send</button>
      </div>

      {reply ? (
        <>
          <div className="hr" />
          <div style={{ whiteSpace: "pre-wrap" }}>{reply}</div>
          {actions?.length ? (
            <div className="hr" />
          ) : null}
          <div className="row">
            {actions.map((a) => (
              <button
                key={a}
                className="btn"
                style={{ background: "rgba(255,255,255,0.06)" }}
                onClick={() => setMsg(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
