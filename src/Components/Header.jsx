import { useLocation } from "react-router-dom";
import { MOCK_EVENTS } from "../constants.jsx";

const ROUTE_META = {
  "/events":    (count) => `${count} events`,
  "/analytics": ()      => `${MOCK_EVENTS.length} total events`,
  "/repos":     ()      => `${[...new Set(MOCK_EVENTS.map(e => e.repo))].length} repos`,
  "/webhooks":  ()      => "endpoint management",
};

export default function Header({ filteredCount }) {
  const { pathname } = useLocation();

  const section  = pathname.replace("/", "") || "events";
  const metaFn   = ROUTE_META[pathname] ?? (() => "");
  const subtitle = metaFn(filteredCount);

  return (
    <div style={{
      height: 52, borderBottom: "1px solid #1e2330",
      display: "flex", alignItems: "center", padding: "0 20px",
      gap: 12, background: "#0a0d12", flexShrink: 0,
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.3px", textTransform: "capitalize" }}>
        {section}
      </div>

      <div style={{ width: 1, height: 16, background: "#1e2330" }} />

      <div style={{ fontSize: 11, color: "#334155" }}>{subtitle}</div>

      <div style={{ flex: 1 }} />

      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#10b981", boxShadow: "0 0 6px #10b98188",
          animation: "pulse 2s infinite",
        }} />
        <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>live</span>
      </div>
    </div>
  );
}