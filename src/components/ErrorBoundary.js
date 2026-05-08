// src/components/ErrorBoundary.js
// Error boundary component for graceful error handling in React
import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            background: "var(--surface)",
            border: "1px solid var(--danger)",
            borderRadius: "8px",
            color: "var(--danger)",
          }}
        >
          <div style={{ fontFamily: "var(--condensed)", fontSize: "1.1rem", marginBottom: 8 }}>
            ⚠ Component Error
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.8rem", color: "var(--text2)" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--accent)",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
