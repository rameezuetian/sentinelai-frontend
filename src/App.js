// src/App.js
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { SocketProvider, useSocket } from "./context/SocketContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import ChatAnalyzer from "./pages/ChatAnalyzer";
import AlertsLog from "./pages/AlertsLog";
import "./App.css";

function NavBar() {
  const { connected, error } = useSocket();
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-text">SENTINEL<span className="brand-ai">AI</span></span>
      </div>
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Chat Analyzer
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Alerts Log
        </NavLink>
      </div>
      <div className="nav-status">
        <span className={`status-dot ${connected ? "online" : "offline"}`} title={error || "No errors"} />
        <span className="status-text" title={error || (connected ? "Connected to backend" : "Disconnected from backend")}>
          {connected ? "LIVE" : "OFFLINE"}
        </span>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="app">
          <ErrorBoundary>
            <NavBar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chat" element={<ChatAnalyzer />} />
                <Route path="/alerts" element={<AlertsLog />} />
              </Routes>
            </main>
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}

