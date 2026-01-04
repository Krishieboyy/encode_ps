import { useState } from "react";
import { useRouter } from "next/router";
import { analyzeIngredients } from "../lib/api";

export default function ScanPage() {
  const router = useRouter();
  const [ingredientsText, setIngredientsText] = useState(
`Ingredients: sugar, glucose syrup, whey (milk), soy lecithin, citric acid (E330), sodium benzoate (E211), natural flavors`
  );
  const [optimizeFor, setOptimizeFor] = useState("general");

  // demo preference ledger (editable later)
  const [prefsJson, setPrefsJson] = useState(`{
  "avoid": [],
  "limit": ["added_sugar"],
  "goals": []
}`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setError("");
    setLoading(true);
    try {
      const user_prefs = JSON.parse(prefsJson);
      const res = await analyzeIngredients({
        ingredients_text: ingredientsText,
        optimize_for: optimizeFor === "none" ? null : optimizeFor,
        user_prefs
      });
      sessionStorage.setItem("analysis_state", JSON.stringify(res));
      router.push("/result");
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Ingredient Copilot</div>
          <div className="subtitle">Paste ingredients → intent-first decision card</div>
        </div>
        <a className="btn" href="/compare">Compare</a>
      </div>

      <div className="grid">
        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Ingredients text</div>
          <textarea value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
          <div className="hr" />
          <div className="row">
            <select className="select" value={optimizeFor} onChange={(e) => setOptimizeFor(e.target.value)}>
              <option value="general">Optimize: General</option>
              <option value="sugar">Optimize: Sugar</option>
              <option value="gut">Optimize: Gut</option>
              <option value="allergens">Optimize: Allergens</option>
              <option value="muscle">Optimize: Muscle</option>
              <option value="clean_label">Optimize: Clean label</option>
              <option value="kids">Optimize: Kids</option>
              <option value="none">No hint (pure inference)</option>
            </select>

            <button className="btn" onClick={analyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error ? <div style={{ marginTop: 10, color: "var(--red)" }}>{error}</div> : null}
        </div>

        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Preference ledger (optional)</div>
          <div className="muted">
            This is the “no-long-form” personalization. Keep it minimal and editable.
          </div>
          <div className="hr" />
          <textarea
            style={{ minHeight: 180 }}
            value={prefsJson}
            onChange={(e) => setPrefsJson(e.target.value)}
          />
          <div className="small" style={{ marginTop: 8 }}>
            Example: set <code>avoid</code> to ["lactose"] or <code>limit</code> to ["added_sugar"].
          </div>
        </div>
      </div>
    </div>
  );
}
