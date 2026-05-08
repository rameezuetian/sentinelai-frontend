// src/services/api.js — FastAPI version
const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const api = {
  // ── CV Controls ──────────────────────────────────────────────
  /**
   * Start CV processing on the already-uploaded video.
   * Backend will error if no video has been uploaded first.
   */
  startProcessing: () =>
    fetch(`${BASE}/api/start`, { method: "POST" }).then(r => {
      if (!r.ok) return r.json().then(e => Promise.reject(new Error(e.detail || "Start failed")));
      return r.json();
    }),

  stopProcessing: () =>
    fetch(`${BASE}/api/stop`, { method: "POST" }).then(r => r.json()),

  // ── Stats & Alerts ───────────────────────────────────────────
  getStats  : () => fetch(`${BASE}/api/stats`).then(r => r.json()),
  getAlerts : (limit = 50) => fetch(`${BASE}/api/alerts?limit=${limit}`).then(r => r.json()),
  clearAlerts: () => fetch(`${BASE}/api/alerts`, { method: "DELETE" }).then(r => r.json()),
  getHealth : () => fetch(`${BASE}/api/health`).then(r => r.json()),

  // ── NLP ──────────────────────────────────────────────────────
  analyzeChat: (text) =>
    fetch(`${BASE}/api/analyze_chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(r => r.json()),

  analyzeBatch: (texts) =>
    fetch(`${BASE}/api/analyze_batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(texts),
    }).then(r => r.json()),

  // ── Video Upload ─────────────────────────────────────────────
  /**
   * Upload a video file to the backend.
   * Returns: { status, filename, path, size_mb, message }
   */
  uploadVideo: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`${BASE}/api/upload_video`, { method: "POST", body: fd })
      .then(r => {
        if (!r.ok) return r.json().then(e => Promise.reject(new Error(e.detail || "Upload failed")));
        return r.json();
      });
  },

  // ── Stream URLs ──────────────────────────────────────────────
  videoFeedUrl  : `${BASE}/video_feed`,
  heatmapFeedUrl: `${BASE}/heatmap_feed`,
  docsUrl       : `${BASE}/docs`,
};
