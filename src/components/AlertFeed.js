// src/components/AlertFeed.js
export default function AlertFeed({ alerts = [] }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:8,
      maxHeight:560, overflowY:"auto",
      paddingRight:4
    }}>
      {alerts.length === 0 && (
        <div style={{
          textAlign:"center", color:"var(--text-muted)",
          fontFamily:"var(--font-mono)", fontSize:"0.85rem",
          marginTop:50
        }}>
          No alerts yet
        </div>
      )}
      {alerts.map((alert, i) => {
        const type = (alert.type || "").toLowerCase().replace("_threat","");
        return (
          <div key={i} className={`alert-item ${type}`}>
            <div className="alert-type">⚠ {alert.type}</div>
            <div className="alert-time">{alert.timestamp}</div>
            <div className="alert-detail">
              {(alert.details || "").substring(0, 90)}
            </div>
            <div className="alert-conf">
              Confidence: {Math.round((alert.confidence || 0) * 100)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
