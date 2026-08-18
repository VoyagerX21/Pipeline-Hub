export default function StatCard({ label, value, sub, accent = "var(--primary)", icon: Icon }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-base)",
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          {label}
        </span>
        {Icon && <Icon size={16} color={accent} style={{ opacity: 0.85 }} />}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--text-primary)",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "-0.5px",
          lineHeight: 1.1,
        }}
      >
        {value ?? "—"}
      </div>

      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
      )}
    </div>
  );
}