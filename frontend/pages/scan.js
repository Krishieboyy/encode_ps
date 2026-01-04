// frontend/pages/scan.js
import { useState } from "react";
import { useRouter } from "next/router";
import { analyzeIngredients } from "../lib/api";

export default function ScanPage() {
  const router = useRouter();

  const [avoid, setAvoid] = useState([]);
  const [limit, setLimit] = useState(["added_sugar"]);
  const [goals, setGoals] = useState([]);

  const userPrefs = { avoid, limit, goals };

  const [ingredientsText, setIngredientsText] = useState("");
  const [prefsText, setPrefsText] = useState(
    JSON.stringify({ avoid: [], limit: ["added_sugar"], goals: [] }, null, 2)
  );
  const [optimizeFor, setOptimizeFor] = useState("general");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = {
    "Breakfast cereal":
      "Ingredients: whole grain oats, sugar, corn syrup, salt, natural flavors",
    "Instant noodles":
      "Ingredients: wheat flour, palm oil, salt, flavor enhancer (E621), acidity regulator (E330), dehydrated vegetables",
    "Protein bar":
      "Ingredients: whey protein (milk), dates, cocoa, soy lecithin, natural flavors",
  };

  function parsePrefsSafely(text) {
    try {
      const obj = JSON.parse(text || "{}");
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      throw new Error("Preference ledger must be valid JSON.");
    }
  }

  const onAnalyze = async () => {
    setError("");
    if (!ingredientsText.trim()) {
      setError("Paste an ingredient list first.");
      return;
    }

    let userPrefs = {};
    try {
      userPrefs = parsePrefsSafely(prefsText);
    } catch (e) {
      setError(e.message);
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeIngredients({
        ingredients_text: ingredientsText,
        optimize_for: optimizeFor,
        user_prefs: userPrefs,
      });

      // Store result for result page
      sessionStorage.setItem("last_analysis", JSON.stringify(data));

      // Go to your results page
      router.push("/result");
    } catch (e) {
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <div className="logo">
              <svg
                className="logoIcon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Lens */}
                <circle
                  cx="28"
                  cy="28"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="4"
                  opacity="0.6"
                />

                {/* Handle */}
                <path
                  d="M38 38L56 56"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Detective hat hint */}
                <path
                  d="M16 16C18 10 38 10 40 16"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </div>

            <div>
              <h1>LabelLens</h1>
            </div>
          </div>

          <button className="btn" onClick={() => router.push("/compare")}>
            Compare
          </button>
        </div>

        <div className="thinkBox">
          <div className="thinkTitle">What this tool checks</div>
          <ul className="thinkList">
            <li>
              Parses the label text and groups ingredients into common buckets
              (sweeteners, oils, additives, allergens).
            </li>
            <li>
              Scores the list for your chosen goal and adds a cautious “unknown
              ingredient” risk estimate when something isn’t recognized.
            </li>
            <li>
              Returns a decision card with the main concern, tradeoffs, and
              what’s uncertain from label-only data.
            </li>
          </ul>
        </div>

        <div className="grid">
          <div className="card">
            <div className="cardHeader">
              <h2 className="cardTitle">Ingredients text</h2>
              <p className="cardSub">
                Paste exactly what’s on the label (commas / + / parentheses all
                OK).
              </p>
            </div>

            <textarea
              className="textarea mono"
              placeholder="e.g. Ingredients: sugar, glucose syrup, whey (milk), soy lecithin, citric acid (E330), sodium benzoate (E211)…"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
            />

            <div className="row">
              <select
                className="select"
                value={optimizeFor}
                onChange={(e) => setOptimizeFor(e.target.value)}
              >
                <option value="general">Optimize: General</option>
                <option value="kids">Kids</option>
                <option value="sugar">Sugar</option>
                <option value="gut">Gut</option>
                <option value="allergens">Allergens</option>
                <option value="clean_label">Clean label</option>
                <option value="muscle">Muscle</option>
              </select>

              <button
                className="btn btnPrimary"
                onClick={onAnalyze}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            <div className="chips">
              {Object.keys(examples).map((k) => (
                <button
                  key={k}
                  className="chip"
                  onClick={() => setIngredientsText(examples[k])}
                  type="button"
                >
                  {k}
                </button>
              ))}
            </div>

            {error ? (
              <div
                style={{
                  marginTop: 12,
                  color: "rgba(255,120,120,0.95)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            ) : null}
          </div>

          <div className="card">
            <div className="cardHeader">
              <h2 className="cardTitle">Preferences (optional)</h2>
              <p className="cardSub">
                Tap to add/remove. This replaces the JSON ledger.
              </p>
            </div>

            <div className="prefsGrid">
              <PrefGroup
                title="Avoid"
                subtitle="Hard no"
                options={[
                  "lactose",
                  "gluten",
                  "soy",
                  "nuts",
                  "egg",
                  "fish",
                  "sesame",
                ]}
                value={avoid}
                setValue={setAvoid}
              />

              <PrefGroup
                title="Limit"
                subtitle="Try to keep low"
                options={[
                  "added_sugar",
                  "artificial_sweeteners",
                  "sodium",
                  "caffeine",
                  "ultra_processed",
                  "seed_oils",
                ]}
                value={limit}
                setValue={setLimit}
              />

              <PrefGroup
                title="Goals"
                subtitle="Optimize for"
                options={[
                  "clean_label",
                  "gut_friendly",
                  "high_protein",
                  "kid_friendly",
                  "low_sugar",
                  "allergen_safe",
                ]}
                value={goals}
                setValue={setGoals}
              />
            </div>

            <div className="prefsPreview">
              <div className="prefsPreviewTitle">Preview</div>
              <pre className="prefsCode">
                {JSON.stringify(userPrefs, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefGroup({ title, subtitle, options, value, setValue }) {
  function toggle(opt) {
    setValue((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  }

  return (
    <div className="prefsBlock">
      <div className="prefsHead">
        <div className="prefsTitle">{title}</div>
        <div className="prefsSub">{subtitle}</div>
      </div>

      <div className="chipRow">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`chip ${active ? "chipOn" : ""}`}
              onClick={() => toggle(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className={`prefsSelected ${value.length ? "" : "muted"}`}>
        Selected: <span className="mono">{value.length ? value.join(", ") : "none"}</span>
      </div>
    </div>
  );
}
