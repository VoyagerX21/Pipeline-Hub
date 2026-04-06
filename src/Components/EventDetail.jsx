import Badge from "./Badge.jsx";
import { EVENT_COLORS, PLATFORM_COLORS } from "../constants.jsx";
import { useState } from "react";

export default function EventDetail({ event, onClose }) {
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(false);
  
  if (!event) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#334155",
          fontSize: 13,
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ fontSize: 32 }}>⬡</div>
        <div>Select an event to inspect</div>
      </div>
    );
  }

  const repo = event.repositoryId?.name || "unknown-repo";
  const actor = event.senderId?.name || "unknown-user";
  const timestamp = new Date(event.eventTimestamp);

  return (
    <div style={{ padding: 24, height: "100%", overflowY: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <Badge
              label={event.type.replace("_", " ")}
              color={EVENT_COLORS[event.type]}
            />

            <Badge
              label={event.provider}
              color={PLATFORM_COLORS[event.provider]}
            />
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
            {event.type.replace("_", " ")} event
          </div>

          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
            {repo}/{event.branch || "-"}
          </div>

        </div>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            fontSize: 20,
            padding: 4,
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      {/* Details */}
      {[
        ["Actor", actor],
        ["Repository", repo],
        ["Branch", event.branch || "-"],
        ["Platform", event.provider],
        ["Event Type", event.type.replace("_", " ")],
        ["Timestamp", timestamp.toLocaleString()],
        ["Slack Status", event.slackStatus]
      ].map(([k, v]) => (
        <div
          key={k}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid #1e2330"
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600
            }}
          >
            {k}
          </span>

          <span
            style={{
              fontSize: 13,
              color: "#94a3b8",
              fontFamily: "monospace"
            }}
          >
            {v}
          </span>
        </div>
      ))}

      {/* Payload Preview */}
      <div
        style={{
          marginTop: 20,
          borderRadius: 8,
          border: "1px solid #1e2330",
          background: "#0a0d12",
          overflow: "hidden"
        }}
      >
        {/* Clickable header row */}
        <div
          onClick={() => setIsPayloadExpanded(prev => !prev)}
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            Webhook Payload Preview
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              color: "#475569",
              transform: isPayloadExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }}
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Collapsible payload area */}
        {isPayloadExpanded && (
          <div
            style={{
              maxHeight: 200,
              overflow: "auto",
              borderTop: "1px solid #1e2330",
              padding: "10px 14px"
            }}
          >
            <pre
              style={{
                margin: 0,
                fontSize: 11,
                color: "#64748b",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all"
              }}
            >
              {JSON.stringify(
                event.rawPayload || {
                  event: event.type,
                  provider: event.provider,
                  repository: repo,
                  branch: event.branch,
                  sender: actor,
                  timestamp: timestamp.toISOString()
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}