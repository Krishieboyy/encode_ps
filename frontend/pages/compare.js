// frontend/pages/compare.js
import { useState } from "react";
import { useRouter } from "next/router";
import { analyzeIngredients } from "../lib/api";

function getScore(res) {
  const f = res?.debug?.fit;
  if (typeof f?.score === "number") return f.score;
  if (typeof f?.fit_score === "number") return f.fit_score;
  if (typeof res?.decision_card?.score === "number") return res.decision_card.score;
  if (typeof res?.decision_card?.fit_score === "number") return res.decision_card.fit_score;
  return null;
}

function getColor(res) {
  return res?.debug?.fit?.color || res?.decision_card?.color || "unknown";
}

export default function ComparePage() {
  const router = useRouter();

  const [a, setA] = useState("Ingredients: sugar, glucose syrup, soy lecithin, citric acid");
  const [b, setB] = useState("Ingredients: dates, oats, pea protein, sunflower lecithin, cocoa");
  const [optimizeFor, setOptimizeFor] = useState("sugar");

  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [summary, setSummary] = useState("");

  async function runCompare() {
    const ra = await analyzeIngredients({ ingredients_text: a, optimize_for: optimizeFor, user_prefs: {} });
    const rb = await analyzeIngredients({ ingredients_text: b, optimize_for: optimizeFor, user_prefs: {} });

    setResultA(ra);
    setResultB(rb);

    const sa = getScore(ra);
    const sb = getScore(rb);

    if (sa === null || sb === null) {
      setSummary("Could not compute winner: score missing from one or both responses.");
      return;
    }

    const winner = sa === sb ? "Tie" : sa > sb ? "A" : "B";

    let why = "";
    if (winner === "A") why = "A fits your selected intent better (higher score).";
    else if (winner === "B") why = "B fits your selected intent better (higher score).";
    else why = "Both look similar for your selected intent based on this ingredient text.";

    setSummary(`Winner: ${winner}. ${why}`);
  }

  return (
    <div className="page">
      <div className="shell">
        {/* Top bar */}
        <div className="topbar">
          <div className="brand">
            <div className="logo" aria-hidden="true" />
            <div>
              <h1>Compare</h1>
              <p>Scan/paste two products → see what changed that matters</p>
            </div>
          </div>

          <div className="row" style={{ marginTop: 0 }}>
            <button className="btn" onClick={() => router.push("/scan")}>Back to Scan</button>
          </div>
        </div>

        {/* Setup card */}
        <div className="card">
          <div className="cardHeader" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2 className="cardTitle">Compare setup</h2>
              <p className="cardSub">Choose an intent, paste A + B, then run compare.</p>
            </div>

            <div className="row" style={{ marginTop: 0 }}>
              <select
                className="select"
                value={optimizeFor}
                onChange={(e) => setOptimizeFor(e.target.value)}
              >
                <option value="general">General</option>
                <option value="sugar">Sugar</option>
                <option value="gut">Gut</option>
                <option value="allergens">Allergens</option>
                <option value="muscle">Muscle</option>
                <option value="clean_label">Clean label</option>
                <option value="kids">Kids</option>
              </select>

              <button className="btn btnPrimary" onClick={runCompare}>Run Compare</button>
            </div>
          </div>

          <div className="grid" style={{ marginTop: 14 }}>
            <div>
              <div className="cardSub" style={{ marginBottom: 8 }}>Product A ingredients</div>
              <textarea className="textarea" value={a} onChange={(e) => setA(e.target.value)} />
            </div>
            <div>
              <div className="cardSub" style={{ marginBottom: 8 }}>Product B ingredients</div>
              <textarea className="textarea" value={b} onChange={(e) => setB(e.target.value)} />
            </div>
          </div>

          {summary ? (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.22)",
                  fontWeight: 700,
                }}
              >
                {summary}
              </div>
            </div>
          ) : null}
        </div>

        {/* Results */}
        <div className="grid" style={{ marginTop: 14 }}>
          <CompareCard label="Product A" res={resultA} />
          <CompareCard label="Product B" res={resultB} />
        </div>
      </div>
    </div>
  );
}

function CompareCard({ label, res }) {
  if (!res) return <div className="card"><p className="cardSub">Run compare to see results.</p></div>;

  const score = getScore(res);
  const color = getColor(res);
  const intent =
    res?.decision_card?.intent ||
    res?.inferred_intent?.top_intent ||
    "general";

  const bullets = Array.isArray(res?.decision_card?.bullets) ? res.decision_card.bullets : [];

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono" style={{ fontWeight: 800 }}>{label}</span>
            <span className={`flag flag-${color}`}>{String(color).toUpperCase()}</span>
            <span className="cardSub">for <span className="mono">"{intent}"</span></span>
          </div>
          <div className="mono" style={{ fontWeight: 800 }}>
            {score === null ? "Score: N/A" : `Score: ${score}/100`}
          </div>
        </div>
      </div>

      {bullets.length ? (
        <ul className="ul">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      ) : (
        <p className="cardSub">No bullets available.</p>
      )}
    </div>
  );
}
  