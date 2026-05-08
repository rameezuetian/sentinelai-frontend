// src/pages/Dashboard.js
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { api } from "../services/api";
import AlertFeed from "../components/AlertFeed";
import StatCard from "../components/StatCard";
import "../App.css";

export default function Dashboard() {
  const { stats, alerts, connected, wsError, processingDone, resetProcessingDone } = useSocket();
  const [running,      setRunning]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);   // filename after upload
  const [uploadPct,    setUploadPct]    = useState(0);      // progress 0-100
  const [apiError,     setApiError]     = useState(null);
  const [successMsg,   setSuccessMsg]   = useState(null);
  const fileInputRef = useRef(null);

  // When backend signals video finished, update running state
  useEffect(() => {
    if (processingDone) {
      setRunning(false);
      setSuccessMsg("✅ Video processing complete!");
      resetProcessingDone();
    }
  }, [processingDone, resetProcessingDone]);

  // Show wsError in the error banner
  useEffect(() => {
    if (wsError) setApiError(wsError);
  }, [wsError]);

  // Auto-clear success messages
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // ── Handlers ──────────────────────────────────────────────
  const handleUploadVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setApiError(null);
    setSuccessMsg(null);
    setUploadPct(0);

    // Use XMLHttpRequest so we can track upload progress
    const xhr = new XMLHttpRequest();
    const fd  = new FormData();
    fd.append("file", file);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable)
        setUploadPct(Math.round((evt.loaded / evt.total) * 100));
    };

    xhr.onload = () => {
      setUploading(false);
      setUploadPct(0);
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          setUploadedFile(result.filename);
          setRunning(false);
          setSuccessMsg(`✅ "${result.filename}" uploaded (${result.size_mb} MB). Click ▶ Start to analyse.`);
        } catch {
          setApiError("Upload succeeded but response was unreadable.");
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          setApiError(err.detail || "Upload failed.");
        } catch {
          setApiError(`Upload failed (HTTP ${xhr.status}).`);
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadPct(0);
      setApiError("Network error during upload. Is the backend running?");
    };

    const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
    xhr.open("POST", `${BASE}/api/upload_video`);
    xhr.send(fd);

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleStart = async () => {
    if (!uploadedFile) {
      setApiError("Please upload a video file first.");
      return;
    }
    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      const result = await api.startProcessing();
      if (result.status === "started" || result.status === "already_running") {
        setRunning(true);
      }
    } catch (err) {
      setApiError(err.message || "Failed to start processing.");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const result = await api.stopProcessing();
      if (result.status === "stopped") {
        setRunning(false);
        setSuccessMsg("⏹ Processing stopped.");
      }
    } catch (err) {
      setApiError(err.message || "Failed to stop processing.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div>
      <div className="page-title">
        <span>⬡</span>
        <div>
          Live Surveillance <span className="highlight">Dashboard</span>
        </div>
      </div>

      {/* Error banner */}
      {apiError && (
        <div className="card alert-active" style={{ marginBottom: 16, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--danger)" }}>
            ⚠ {apiError}
          </span>
          <button onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Success banner */}
      {successMsg && (
        <div className="card" style={{ marginBottom: 16, padding: "12px 16px", borderColor: "var(--ok)", background: "rgba(5,150,105,0.08)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--ok)" }}>
            {successMsg}
          </span>
        </div>
      )}

      {/* ── Top row: controls + stat cards ── */}
      <div className="grid-2" style={{ marginBottom: 32 }}>

        {/* Controls card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-title">Controls</div>

          {/* Upload area */}
          <div
            style={{
              border: "2px dashed var(--border-glow)",
              borderRadius: 10,
              padding: "16px 12px",
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
              transition: "border-color 0.2s",
              background: "var(--surface2)",
            }}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>📁</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", marginBottom: 4 }}>
              {uploading ? `Uploading… ${uploadPct}%` : uploadedFile ? `📹 ${uploadedFile}` : "Click to Upload Video"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {uploading ? "Please wait" : "MP4, AVI, MOV, MKV, WebM · max 500 MB"}
            </div>

            {/* Progress bar */}
            {uploading && (
              <div style={{ marginTop: 10, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${uploadPct}%`, height: "100%", background: "var(--accent)", transition: "width 0.2s", borderRadius: 2 }} />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/avi,video/quicktime,video/x-matroska,video/webm"
              style={{ display: "none" }}
              onChange={handleUploadVideo}
              disabled={uploading}
            />
          </div>

          {/* Start / Stop buttons */}
          <button
            className="btn btn-start"
            onClick={handleStart}
            disabled={running || loading || !connected || !uploadedFile || uploading}
            title={
              !connected   ? "Backend offline"            :
              !uploadedFile ? "Upload a video file first" :
              uploading     ? "Wait for upload to finish"  : ""
            }
            style={{ width: "100%" }}
          >
            {loading && !running ? "Starting…" : "▶ Start Analysis"}
          </button>

          <button
            className="btn btn-stop"
            onClick={handleStop}
            disabled={!running || loading}
            style={{ width: "100%" }}
          >
            {loading && running ? "Stopping…" : "■ Stop"}
          </button>

          {/* Frame counter */}
          <div style={{ marginTop: "auto", textAlign: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <div className="card-label" style={{ marginBottom: 4 }}>Frames Processed</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)" }}>
              {(stats.frame_count || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid-3">
          <StatCard
            label="Fighting"
            icon="⚔"
            detected={stats.fighting?.detected}
            confidence={stats.fighting?.confidence}
            details={stats.fighting?.details}
          />
          <StatCard
            label="Panic"
            icon="🌀"
            detected={stats.panic?.detected}
            confidence={stats.panic?.confidence}
            details={stats.panic?.details}
          />
          <StatCard
            label="Overcrowding"
            icon="👥"
            detected={stats.overcrowding?.detected}
            confidence={stats.overcrowding?.confidence}
            details={`People: ${stats.person_count || 0} | Density: ${stats.density_level || "low"}`}
          />
        </div>
      </div>

      {/* ── Main: 4-panel video feed + alerts ── */}
      <div className="grid-2">
        {/* Video feed */}
        <div>
          <div className="section-title">
            4-Panel Analysis Feed
          </div>
          <div className="video-container">
            {running ? (
              <img
                src={api.videoFeedUrl}
                alt="4-panel surveillance feed"
                style={{ width: "100%", display: "block" }}
              />
            ) : (
              <div style={{
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                background: "rgba(0,0,0,0.6)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                textAlign: "center",
                padding: 32,
              }}>
                {!connected ? (
                  <>
                    <div style={{ fontSize: "2.5rem" }}>🔌</div>
                    <div style={{ color: "var(--danger)" }}>BACKEND OFFLINE</div>
                    <div>Start the FastAPI server first</div>
                  </>
                ) : !uploadedFile ? (
                  <>
                    <div style={{ fontSize: "2.5rem" }}>📁</div>
                    <div>No video loaded</div>
                    <div>Upload a video using the panel on the left</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "2.5rem" }}>▶</div>
                    <div style={{ color: "var(--accent)" }}>Ready — {uploadedFile}</div>
                    <div>Click <strong>▶ Start Analysis</strong> to begin</div>
                  </>
                )}
              </div>
            )}

            {/* LIVE / STOPPED badge */}
            <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700,
                background: running ? "rgba(16,185,129,0.9)" : "rgba(100,116,139,0.85)",
                color: "#fff", padding: "4px 12px", borderRadius: 6,
                letterSpacing: 1, backdropFilter: "blur(4px)",
                boxShadow: running ? "0 0 12px rgba(16,185,129,0.5)" : "none",
              }}>
                {running ? "● LIVE" : "■ STOPPED"}
              </span>
            </div>

            {/* Panel labels overlay (only when running) */}
            {running && (
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 4, zIndex: 2, pointerEvents: "none" }}>
                {["Fighting", "Panic", "Crowd", "Heatmap"].map((lbl, i) => (
                  <span key={i} style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700,
                    background: "rgba(0,0,0,0.7)", color: "#fff",
                    padding: "2px 8px", borderRadius: 4, letterSpacing: 0.5,
                  }}>
                    {lbl}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* People count bar */}
          <div className="card" style={{ marginTop: 12, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-label" style={{ margin: 0 }}>People in frame</span>
              <span style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontSize: "1.1rem", fontWeight: 700 }}>
                {stats.person_count || 0}
              </span>
            </div>
            <div className="conf-bar" style={{ marginTop: 8, height: 6 }}>
              <div
                className={`conf-fill ${stats.overcrowding?.detected ? "danger" : ""}`}
                style={{ width: `${Math.min(((stats.person_count || 0) / 15) * 100, 100)}%` }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>0</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>
                Density: {(stats.density_level || "low").toUpperCase()}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>15+</span>
            </div>
          </div>
        </div>

        {/* Alert feed */}
        <div>
          <div className="section-title">Alert Feed</div>
          <AlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
