// src/components/StatCard.js
export default function StatCard({ label, icon, detected, confidence, details }) {
  const pct = Math.round((confidence || 0) * 100);
  return (
    <div className={`card ${detected ? "alert-active" : ""}`}>
      <div className="card-label">{icon} {label}</div>
      <div className={`card-value ${detected ? "danger" : "ok"}`}>
        {detected ? "ALERT" : "CLEAR"}
      </div>
      <div className="card-sub" title={details}>
        {details ? details.substring(0, 50) : `Confidence: ${pct}%`}
      </div>
      <div className="conf-bar">
        <div
          className={`conf-fill ${detected ? "danger" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
