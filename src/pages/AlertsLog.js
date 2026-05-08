// src/pages/AlertsLog.js
import { useState } from "react";
import { useSocket } from "../context/SocketContext";

const TYPE_COLORS = {
  FIGHTING: "var(--danger)",
  PANIC: "var(--warning)",
  OVERCROWDING: "var(--accent)",
  NLP_THREAT: "#a855f7",
};

const TYPE_ICONS = {
  FIGHTING: "⚔",
  PANIC: "🌀",
  OVERCROWDING: "👥",
  NLP_THREAT: "💬",
};

export default function AlertsLog() {
  const { alerts } = useSocket();
  const [filter, setFilter] = useState("ALL");

  const types = ["ALL", "FIGHTING", "PANIC", "OVERCROWDING", "NLP_THREAT"];

  const filtered = filter === "ALL" ? alerts : alerts.filter((a) => a.type === filter);

  // Count per type
  const counts = types.reduce((acc, t) => {
    acc[t] = t === "ALL" ? alerts.length : alerts.filter((a) => a.type === t).length;
    return acc;
  }, {});

  // Export alerts as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(filtered, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alerts-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-title">
        <span>◎</span> Alerts <span>Log</span>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {["FIGHTING", "PANIC", "OVERCROWDING", "NLP_THREAT"].map((type) => (
          <div key={type} className="card">
            <div className="card-label">
              {TYPE_ICONS[type]} {type.replace("_", " ")}
            </div>
            <div className="card-value" style={{ color: TYPE_COLORS[type] }}>
              {counts[type]}
            </div>
            <div className="card-sub">total alerts</div>
          </div>
        ))}
      </div>

      {/* Filter buttons + export */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {types.map((t) => (
            <button
              key={t}
              className="btn"
              style={{
                borderColor:
                  filter === t ? TYPE_COLORS[t] || "var(--accent)" : "var(--border2)",
                color: filter === t ? TYPE_COLORS[t] || "var(--accent)" : "var(--text2)",
                background:
                  filter === t
                    ? `${(TYPE_COLORS[t] || "var(--accent)")}18`
                    : "transparent",
                fontSize: "0.72rem",
                padding: "6px 14px",
              }}
              onClick={() => setFilter(t)}
            >
              {t === "ALL"
                ? `ALL (${counts.ALL})`
                : `${TYPE_ICONS[t]} ${t.replace("_", " ")} (${counts[t]})`}
            </button>
          ))}
        </div>
        <button
          className="btn"
          style={{
            borderColor: "var(--border2)",
            color: "var(--text2)",
            fontSize: "0.72rem",
            padding: "6px 14px",
          }}
          onClick={handleExport}
          disabled={filtered.length === 0}
          title={filtered.length === 0 ? "No alerts to export" : "Export as JSON"}
        >
          📥 Export
        </button>
      </div>

      {/* Alerts table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 130px 80px 1fr",
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface2)",
          }}
        >
          {["Timestamp", "Type", "Confidence", "Details"].map((h) => (
            <div
              key={h}
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.65rem",
                letterSpacing: 1,
                color: "var(--text3)",
                textTransform: "uppercase",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ maxHeight: 520, overflowY: "auto" }}>
          {filtered.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                fontFamily: "var(--mono)",
                color: "var(--text3)",
                fontSize: "0.8rem",
              }}
            >
              No alerts recorded
            </div>
          )}
          {filtered.map((alert, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 130px 80px 1fr",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                borderLeft: `3px solid ${TYPE_COLORS[alert.type] || "var(--text3)"}`,
                transition: "background 0.15s",
                cursor: "default",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  color: "var(--text2)",
                }}
              >
                {alert.timestamp || new Date().toLocaleTimeString()}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  color: TYPE_COLORS[alert.type] || "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {TYPE_ICONS[alert.type]} {alert.type?.replace("_", " ")}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  color: "var(--text2)",
                }}
              >
                {((alert.confidence || 0) * 100).toFixed(0)}%
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text2)",
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}
              >
                {alert.details || "No details provided"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export note */}
      <div
        style={{
          marginTop: 12,
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          color: "var(--text3)",
        }}
      >
        📁 Alerts also saved to: outputs/logs/alerts.json | Total: {alerts.length}
      </div>
    </div>
  );
}

