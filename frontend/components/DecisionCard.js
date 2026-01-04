export default function DecisionCard({ card }) {
  if (!card) return null;

  const color = card.color;
  const pillStyle = {
    background:
      color === "green" ? "rgba(29, 209, 161, 0.18)"
      : color === "yellow" ? "rgba(254, 202, 87, 0.18)"
      : "rgba(255, 107, 107, 0.18)"
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{card.headline}</div>
          <div className="muted">{card.why_it_matters}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="pill" style={pillStyle}>
            Score: {card.fit_score}/100
          </div>
          <div className="small">Intent: {card.top_intent}</div>
        </div>
      </div>

      <div className="hr" />

      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        {card.bullets?.slice(0, 3).map((b, idx) => (
          <li key={idx}>{b}</li>
        ))}
      </ul>

      <div className="hr" />
      <div className="small">
        Recognized: {card.details?.recognized_count ?? "-"} | Unknown: {card.details?.unknown_count ?? "-"}
      </div>
    </div>
  );
}
