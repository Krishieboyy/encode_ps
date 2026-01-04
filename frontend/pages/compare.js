import { useState } from "react";
import { analyzeIngredients } from "../lib/api";
import DecisionCard from "../components/DecisionCard";

export default function ComparePage() {
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

    const sa = ra.decision_card.fit_score;
    const sb = rb.decision_card.fit_score;

    const winner = sa === sb ? "Tie" : (sa > sb ? "A" : "B");
    let why = "";
    if (winner === "A") why = "A fits your selected intent better (higher score, fewer key flags).";
    else if (winner === "B") why = "B fits your selected intent better (higher score, fewer key flags).";
    else why = "Both look similar for your selected intent based on this ingredient text.";

    setSummary(`Winner: ${winner}. ${why}`);
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Compare</div>
          <div className="subtitle">Scan/paste two products → see what changed that matters</div>
        </div>
        <a className="btn" href="/scan">Back to Scan</a>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900 }}>Compare setup</div>
          <div className="row">
            <select className="select" value={optimizeFor} onChange={(e) => setOptimizeFor(e.target.value)}>
              <option value="general">General</option>
              <option value="sugar">Sugar</option>
              <option value="gut">Gut</option>
              <option value="allergens">Allergens</option>
              <option value="muscle">Muscle</option>
              <option value="clean_label">Clean label</option>
              <option value="kids">Kids</option>
            </select>
            <button className="btn" onClick={runCompare}>Run Compare</button>
          </div>
        </div>

        <div className="hr" />

        <div className="grid">
          <div>
            <div className="small">Product A ingredients</div>
            <textarea value={a} onChange={(e) => setA(e.target.value)} />
          </div>
          <div>
            <div className="small">Product B ingredients</div>
            <textarea value={b} onChange={(e) => setB(e.target.value)} />
          </div>
        </div>

        {summary ? (
          <>
            <div className="hr" />
            <div style={{ fontWeight: 900 }}>{summary}</div>
          </>
        ) : null}
      </div>

      <div className="grid" style={{ marginTop: 14 }}>
        <div>{resultA ? <DecisionCard card={resultA.decision_card} /> : null}</div>
        <div>{resultB ? <DecisionCard card={resultB.decision_card} /> : null}</div>
      </div>
    </div>
  );
}