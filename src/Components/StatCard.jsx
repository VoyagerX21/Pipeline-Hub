export default function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#0f1117", border: "1px solid #1e2330",
      borderRadius: 10, padding: "18px 22px",
      borderLeft: `3px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: 6
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#475569" }}>{sub}</div>}
    </div>
  );
}