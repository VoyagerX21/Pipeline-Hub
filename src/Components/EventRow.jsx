import Badge from "./Badge.jsx";
import { PLATFORM_ICONS, PLATFORM_COLORS, EVENT_COLORS, timeAgo } from "../constants.jsx";

export default function EventRow({ event, onClick, selected }) {
  const provider = event.provider || event.platform || "github";
  const type = event.type || event.eventType || "unknown";
  const repo = event.repositoryId?.name || event.repository?.name || event.repo || "unknown-repo";
  const actor = event.senderId?.username || event.sender?.username || event.actor || "unknown";
  const timestamp = event.eventTimestamp || event.ts || event.timestamp || event.createdAt || Date.now();
  const typeLabel = String(type).replace("_", " ");
  const typeColor = EVENT_COLORS[type] || "#64748b";
  const providerColor = PLATFORM_COLORS[provider] || "#94a3b8";
  const providerIcon = PLATFORM_ICONS[provider] || null;

  return (
    <div
      onClick={() => onClick(event)}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #0f1117",
        cursor: "pointer",
        background: selected ? "#1a2035" : "transparent",
        borderLeft: selected ? "2px solid #3b82f6" : "2px solid transparent",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#0f1117"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Platform icon */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ color: providerColor }}>
          {providerIcon}
        </div>
      </div>

      {/* Event content */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <Badge
            label={typeLabel}
            color={typeColor}
          />

          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
            {repo}
          </span>

          {event.branch && (
            <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
              /{event.branch}
            </span>
          )}
        </div>

        <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>
          by <span style={{ color: "#64748b" }}>{actor}</span>
        </div>
      </div>

      {/* Time */}
      <div style={{ fontSize: 11, color: "#334155", whiteSpace: "nowrap", fontFamily: "monospace" }}>
        {timeAgo(timestamp)}
      </div>
    </div>
  );
}