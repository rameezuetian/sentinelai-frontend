// src/pages/ChatAnalyzer.js
import { useState } from "react";
import { api } from "../services/api";

export default function ChatAnalyzer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeChat(input.trim());
      setResult(res);
      setHistory((prev) =>
        [{ text: input.trim(), ...res, id: Date.now() }, ...prev].slice(0, 20)
      );
    } catch (err) {
      const errorMsg = err.message || "Failed to analyze text";
      setError(errorMsg);
      setResult({ error: errorMsg });
      console.error("Analysis error:", err);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      analyze();
    }
  };

  const quickTests = [
    "kal dhamaka hoga",
    "bomb blast hone wala hai",
    "aaj market jana hai",
    "maar dalo usko",
    "friends ke sath party hai",
    "attack karo abhi",
  ];

  return (
    <div>
      <div className="page-title">
        <span>◈</span> NLP Chat <span>Analyzer</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left: input + result */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Input area */}
          <div className="card">
            <div className="section-title">Enter Message</div>
            <textarea
              className="input-field"
              placeholder="Type Roman Urdu or English message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={4}
              disabled={loading}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={analyze}
                disabled={loading || !input.trim()}
              >
                {loading ? "Analyzing..." : "⬡ Analyze"}
              </button>
              <button
                className="btn"
                style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
                onClick={() => {
                  setInput("");
                  setResult(null);
                  setError(null);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Result */}
          {result && !result.error && (
            <div className={`card ${result.detected ? "alert-active" : "ok-active"}`}>
              <div className="section-title">Detection Result</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: result.detected
                      ? "rgba(225, 29, 72, 0.15)"
                      : "rgba(5, 150, 105, 0.15)",
                    border: `2px solid ${result.detected ? "var(--danger)" : "var(--ok)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                  }}
                >
                  {result.detected ? "🚨" : "✅"}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--condensed)",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: result.detected ? "var(--danger)" : "var(--ok)",
                      letterSpacing: 2,
                    }}
                  >
                    {result.label || (result.detected ? "THREAT" : "NORMAL")}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.8rem",
                      color: "var(--text2)",
                    }}
                  >
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="card-label">Threat Probability</div>
              <div className="conf-bar" style={{ height: 8, marginTop: 6 }}>
                <div
                  className={`conf-fill ${result.detected ? "danger" : ""}`}
                  style={{
                    width: `${result.confidence * 100}%`,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.62rem",
                    color: "var(--text3)",
                  }}
                >
                  SAFE
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.8rem",
                    color: result.detected ? "var(--danger)" : "var(--ok)",
                  }}
                >
                  {(result.confidence * 100).toFixed(1)}%
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.62rem",
                    color: "var(--text3)",
                  }}
                >
                  THREAT
                </span>
              </div>

              {/* Analyzed text */}
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "var(--surface2)",
                  borderRadius: 6,
                  fontFamily: "var(--mono)",
                  fontSize: "0.8rem",
                  color: "var(--text2)",
                }}
              >
                "{result.text || input}"
              </div>
            </div>
          )}

          {/* Error display */}
          {(error || result?.error) && (
            <div className="card alert-active">
              <span
                style={{
                  color: "var(--danger)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.85rem",
                }}
              >
                ⚠ {error || result.error}
              </span>
            </div>
          )}

          {/* Quick test buttons */}
          <div className="card">
            <div className="section-title">Quick Tests</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {quickTests.map((t, i) => (
                <button
                  key={i}
                  className="btn"
                  style={{
                    borderColor: "var(--border2)",
                    color: "var(--text2)",
                    fontSize: "0.72rem",
                    padding: "6px 12px",
                  }}
                  onClick={() => {
                    setInput(t);
                    setResult(null);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: history */}
        <div>
          <div className="section-title">Analysis History</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 620,
              overflowY: "auto",
            }}
          >
            {history.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text3)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.78rem",
                  marginTop: 40,
                }}
              >
                No analysis yet
              </div>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${
                    item.detected ? "rgba(225, 29, 72, 0.3)" : "var(--border)"
                  }`,
                  borderLeft: `3px solid ${
                    item.detected ? "var(--danger)" : "var(--ok)"
                  }`,
                  borderRadius: "0 8px 8px 0",
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => setInput(item.text)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.68rem",
                      color: item.detected ? "var(--danger)" : "var(--ok)",
                    }}
                  >
                    {item.detected ? "THREAT" : "NORMAL"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.65rem",
                      color: "var(--text3)",
                    }}
                  >
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text)",
                    lineHeight: 1.4,
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
