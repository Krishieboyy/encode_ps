// frontend/pages/result.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import ChatBox from "../components/ChatBox";

// --------- helpers: support both old + new backend schemas ----------
const truthy = (v) => v === true;

function isKnown(ing) {
  return (
    truthy(ing.recognized) ||
    truthy(ing.known) ||
    truthy(ing.is_known) ||
    truthy(ing.isKnown)
  );
}

function getName(ing) {
  return ing.canonical || ing.name || ing.raw || ing.original || "unknown";
}

function getRaw(ing) {
  return ing.raw || ing.original || ing.canonical || ing.name || "";
}

function getTags(ing) {
  const t = ing.tags ?? ing.flags ?? ing.labels ?? [];
  return Array.isArray(t) ? t : [];
}

function safeArr(x) {
  return Array.isArray(x) ? x : [];
}

export default function ResultPage() {
  const router = useRouter();
  const [state, setState] = useState(null);

  useEffect(() => {
    // NEW key (used by updated scan flow)
    const rawNew = sessionStorage.getItem("last_analysis");
    if (rawNew) {
      setState(JSON.parse(rawNew));
      return;
    }
    // OLD key (backwards compatibility)
    const rawOld = sessionStorage.getItem("analysis_state");
    if (rawOld) {
      setState(JSON.parse(rawOld));
      return;
    }
  }, []);

  const normalized = useMemo(
    () => safeArr(state?.normalized_ingredients),
    [state]
  );

  // Fit can be stored in multiple places depending on backend evolution
  const fit = useMemo(() => {
    const f =
      state?.debug?.fit || state?.fit || state?.decision_card?.fit || null;

    const recognizedCount =
      typeof f?.recognized_count === "number"
        ? f.recognized_count
        : normalized.filter(isKnown).length;

    const unknownCount =
      typeof f?.unknown_count === "number"
        ? f.unknown_count
        : Math.max(0, normalized.length - recognizedCount);

    return {
      color: f?.color || state?.decision_card?.color || "unknown",
      score:
        typeof f?.score === "number"
          ? f.score
          : typeof f?.fit_score === "number"
          ? f.fit_score
          : typeof state?.decision_card?.score === "number"
          ? state.decision_card.score
          : null,

      recognized_count: recognizedCount,
      unknown_count: unknownCount,
    };
  }, [state, normalized]);

  const intent = useMemo(() => {
    return (
      state?.decision_card?.intent ||
      state?.inferred_intent?.top_intent ||
      state?.inferred_intent?.intent ||
      "general"
    );
  }, [state]);

  const bullets = useMemo(
    () => safeArr(state?.decision_card?.bullets),
    [state]
  );

  if (!state) {
    return (
      <div className="page">
        <div className="shell">
          <div className="card">
            <div className="cardHeader">
              <h2 className="cardTitle">No analysis yet</h2>
              <p className="cardSub">Go to Scan and run an analysis.</p>
            </div>
            <div className="row">
              <button
                className="btn btnPrimary"
                onClick={() => router.push("/scan")}
              >
                Back to Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="shell">
        {/* Top bar */}
        <div className="topbar">
          <div className="brand">
            <div className="logo" aria-hidden="true" />
            <div>
              <h1>LabelLens</h1>
              <p>Decision card + recognized ingredients</p>
            </div>
          </div>

          <div className="row" style={{ marginTop: 0 }}>
            <button className="btn" onClick={() => router.push("/scan")}>
              New Scan
            </button>
            <button className="btn" onClick={() => router.push("/compare")}>
              Compare
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid">
          {/* Left column */}
          <div style={{ display: "grid", gap: 16 }}>
            {/* Decision Card (new theme, no dependency on old DecisionCard.js) */}
            <div className="card">
              <div className="cardHeader">
                {/* Top row: Flag + Score */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span className={`flag flag-${fit.color || "unknown"}`}>
                      {(fit.color || "unknown").toUpperCase()}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "rgba(234,240,255,0.65)",
                        }}
                      >
                        Score
                      </span>
                      <span
                        style={{ fontSize: 18, fontWeight: 800 }}
                        className="mono"
                      >
                        {fit.score === null ? "N/A" : `${fit.score}/100`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Second row */}
                <h2 className="cardSub" style={{ marginTop: 10 }}>
                  Recognized:{" "}
                  <span className="mono">{fit.recognized_count}</span>
                  {" • "}
                  Unknown: <span className="mono">{fit.unknown_count}</span>
                </h2>
              </div>

              {bullets.length ? (
                <ul className="ul">
                  {bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="cardSub">
                  No bullets returned (check compose_decision_card).
                </p>
              )}
            </div>

            {/* Ingredients list */}
            <div className="card">
              <div className="cardHeader">
                <h2 className="cardTitle">Ingredients breakdown</h2>
                <p className="cardSub">
                  Recognized + unknown items (unknown may include risk guess).
                </p>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {normalized.map((ing, idx) => {
                  const known = isKnown(ing);
                  const tags = getTags(ing);
                  const displayName = getName(ing);
                  const raw = getRaw(ing);
                  const risk = ing.risk_guess;

                  // Old schema fields (optional)
                  const category = ing.category;
                  const fn = ing.function;
                  const evidence = ing.evidence;

                  return (
                    <div
                      key={`${displayName}-${idx}`}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(0,0,0,0.22)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {displayName}
                            {!known ? (
                              <span
                                style={{
                                  marginLeft: 8,
                                  color: "rgba(234,240,255,0.6)",
                                  fontWeight: 500,
                                }}
                              >
                                (unknown)
                              </span>
                            ) : null}
                          </div>

                          {/* Description line: supports both schemas */}
                          <div
                            style={{
                              color: "rgba(234,240,255,0.72)",
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {known
                              ? [
                                  category,
                                  fn,
                                  evidence ? `evidence: ${evidence}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" • ") || "recognized ingredient"
                              : "unknown ingredient"}
                          </div>

                          <div
                            style={{
                              color: "rgba(234,240,255,0.7)",
                              fontSize: 13,
                              marginTop: 6,
                            }}
                          >
                            tags:{" "}
                            <span className="mono">
                              {tags.length ? tags.join(", ") : "-"}
                            </span>
                          </div>

                          {!known && risk ? (
                            <div
                              style={{
                                color: "rgba(234,240,255,0.7)",
                                fontSize: 13,
                                marginTop: 6,
                              }}
                            >
                              risk:{" "}
                              <span className="mono">
                                {risk.risk_level} ({risk.risk_score}/100)
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <div
                          style={{
                            textAlign: "right",
                            color: "rgba(234,240,255,0.6)",
                            fontSize: 12,
                          }}
                        >
                          {raw ? <div className="mono">{raw}</div> : null}
                        </div>
                      </div>

                      {!known && risk?.reasons?.length ? (
                        <ul className="ul" style={{ marginTop: 10 }}>
                          {risk.reasons.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column: your existing ChatBox */}
          <ChatBox analysisState={state} />
        </div>
      </div>
    </div>
  );
}
