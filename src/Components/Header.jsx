import { useLocation } from "react-router-dom";
import { Activity } from "lucide-react";

const ROUTE_META = {
  "/events": (count) => `${count || 0} events recorded`,
  "/analytics": () => "Real-time metrics & insights",
  "/repos": () => "Connected repositories & sync status",
  "/webhooks": () => "Slack automations & webhook logs",
};

export default function Header({ filteredCount }) {
  const { pathname } = useLocation();

  const sectionName = pathname.replace("/", "") || "events";
  const metaFn = ROUTE_META[pathname] ?? (() => "");
  const subtitle = metaFn(filteredCount);

  const displayTitles = {
    events: "Live VCS Stream",
    analytics: "Analytics Dashboard",
    repos: "Repositories",
    webhooks: "Webhooks & Automation",
  };

  return (
    <header
      style={{
        height: 54,
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 14,
        background: "var(--bg-header)",
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h1
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.2px",
            margin: 0,
          }}
        >
          {displayTitles[sectionName] || sectionName}
        </h1>

        <div style={{ width: 1, height: 16, background: "var(--border-subtle)" }} />

        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {subtitle}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Live Stream Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "var(--success-light)",
          padding: "4px 10px",
          borderRadius: 999,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--success)",
            boxShadow: "0 0 6px rgba(16, 185, 129, 0.5)",
            animation: "pulseGlow 2s infinite ease-in-out",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--success)",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.5px",
          }}
        >
          LIVE
        </span>
      </div>
    </header>
  );
}
