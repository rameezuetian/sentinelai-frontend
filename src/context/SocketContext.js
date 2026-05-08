// src/context/SocketContext.js — FastAPI WebSocket version
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

const SocketContext = createContext(null);

const DEFAULT_STATS = {
  fighting:     { detected: false, confidence: 0, details: "" },
  panic:        { detected: false, confidence: 0, details: "" },
  overcrowding: { detected: false, confidence: 0, details: "" },
  person_count:  0,
  density_level: "low",
  frame_count:   0,
};

export function SocketProvider({ children }) {
  const [stats,       setStats]       = useState(DEFAULT_STATS);
  const [alerts,      setAlerts]      = useState([]);
  const [connected,   setConnected]   = useState(false);
  const [wsError,     setWsError]     = useState(null);
  const [processingDone, setProcessingDone] = useState(false);
  const wsRef = useRef(null);

  const resetProcessingDone = useCallback(() => setProcessingDone(false), []);

  useEffect(() => {
    let pingInterval;
    let reconnectTimeout;

    const connect = () => {
      const WS_URL = "wss://sentinel-fyp.duckdns.org:8000/ws";
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      setWsError(null);

      ws.onopen = () => {
        setConnected(true);
        setWsError(null);
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 30000);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if      (msg.type === "stats_update")    setStats(msg.data);
          else if (msg.type === "new_alert")        setAlerts(p => [msg.data, ...p].slice(0, 100));
          else if (msg.type === "alerts_init")      setAlerts(msg.data || []);
          else if (msg.type === "processing_done") { setStats(msg.data); setProcessingDone(true); }
          else if (msg.type === "error")            setWsError(msg.data);
        } catch (_) {}
      };

      ws.onclose = () => {
        setConnected(false);
        clearInterval(pingInterval);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ stats, alerts, connected, wsError, processingDone, resetProcessingDone }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
