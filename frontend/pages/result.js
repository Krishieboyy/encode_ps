import { useEffect, useState } from "react";
import DecisionCard from "../components/DecisionCard";
import ChatBox from "../components/ChatBox";

export default function ResultPage() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("analysis_state");
    if (raw) setState(JSON.parse(raw));
  }, []);

  if (!state) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 900 }}>No analysis yet</div>
          <div className="muted">Go to Scan and run an analysis.</div>
          <div className="hr" />
          <a className="btn" href="/scan">Back to Scan</a>
        </div>
      </div>
    );
  }

  const card = state.decision_card;

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Decision</div>
          <div className="subtitle">Reasoning + tradeoffs + uncertainty</div>
        </div>
        <div className="row">
          <a className="btn" href="/scan">New Scan</a>
          <a className="btn" href="/compare">Compare</a>
        </div>
      </div>

      <div className="grid">
        <div>
          <DecisionCard card={card} />
          <div className="card" style={{ marginTop: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Recognized ingredients</div>
            <div className="hr" />
            <div style={{ display: "grid", gap: 8 }}>
              {state.normalized_ingredients.map((ing) => (
                <div key={ing.canonical} className="kv">
                  <div>
                    <div style={{ fontWeight: 800 }}>{ing.raw}</div>
                    <div className="small">
                      {ing.known ? `${ing.category} • ${ing.function} • evidence: ${ing.evidence}` : "unknown ingredient"}
                    </div>
                  </div>
                  <div className="small" style={{ textAlign: "right" }}>
                    flags: {(ing.flags || []).join(", ") || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ChatBox analysisState={state} />
      </div>
    </div>
  );
}
