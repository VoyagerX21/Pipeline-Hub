export default function Badge({ label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: `${color}18`, color, border: `1px solid ${color}40`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap"
    }}>
      {label}
    </span>
  );
}