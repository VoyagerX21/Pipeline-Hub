import Badge from "./Badge.jsx";
import { PLATFORM_ICONS, PLATFORM_COLORS, EVENT_COLORS, timeAgo } from "../constants.jsx";
import { GitBranch, Clock } from "lucide-react";

export default function EventRow({ event, onClick, selected }) {
  const provider = event.provider || event.platform || "github";
  const type = event.type || event.eventType || "unknown";
  const repo = event.repositoryId?.name || event.repository?.name || event.repo || "unknown-repo";
  const actor = event.senderId?.name || event.sender?.username || event.actor || "unknown";
  const timestamp = event.eventTimestamp || event.ts || event.timestamp || event.createdAt || 0;
  const typeLabel = String(type).replace("_", " ");
  const typeColor = EVENT_COLORS[type] || "var(--primary)";
  const providerColor = PLATFORM_COLORS[provider] || "var(--text-secondary)";
  const providerIcon = PLATFORM_ICONS[provider] || null;

  return (
    <div
      onClick={() => onClick(event)}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: "13px 18px",
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer",
        background: selected ? "var(--primary-light)" : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Platform icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "var(--bg-card-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: providerColor,
          flexShrink: 0,
        }}
      >
        {providerIcon}
      </div>

      {/* Event Details */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <Badge label={typeLabel} color={typeColor} />

          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {repo}
          </span>

          {event.branch && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <GitBranch size={10} />
              {event.branch}
            </span>
          )}
        </div>

        <div style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
          by <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{actor}</strong>
          {event.message && (
            <span
              style={{
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 240,
                display: "inline-block",
                verticalAlign: "bottom",
                marginLeft: 4,
              }}
            >
              — {event.message}
            </span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <Clock size={11} />
        {timeAgo(timestamp)}
      </div>
    </div>
  );
}
