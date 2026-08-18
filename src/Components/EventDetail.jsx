import { useState } from "react";
import Badge from "./Badge.jsx";
import { EVENT_COLORS, PLATFORM_COLORS } from "../constants.jsx";
import { X, Copy, Check, ChevronDown, ChevronUp, Code2, GitFork, User, Calendar, Radio } from "lucide-react";

export default function EventDetail({ event, onClose }) {
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-muted)",
          fontSize: 13,
          flexDirection: "column",
          gap: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "var(--bg-card-subtle)",
            border: "1px solid var(--border-base)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Code2 size={22} color="var(--text-muted)" />
        </div>
        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Event Inspector</div>
        <div style={{ maxWidth: 260, lineHeight: 1.4 }}>
          Select an event from the stream to view full webhook payload & metadata.
        </div>
      </div>
    );
  }

  const repo = event.repositoryId?.name || event.repository?.name || event.repo || "unknown-repo";
  const actor = event.senderId?.name || event.sender?.username || event.actor || "unknown-user";
  const rawTimestamp = event.eventTimestamp || event.ts || event.timestamp || event.createdAt || null;
  const timestamp = rawTimestamp ? new Date(rawTimestamp) : new Date(0);
  const eventType = event.type || event.eventType || "unknown";
  const provider = event.provider || event.platform || "github";

  const rawJson = JSON.stringify(
    event.rawPayload || {
      event: eventType,
      provider: provider,
      repository: repo,
      branch: event.branch || "main",
      sender: actor,
      timestamp: timestamp.toISOString(),
      slackStatus: event.slackStatus || "sent",
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const detailRows = [
    { label: "Actor / Sender", value: actor, icon: User },
    { label: "Repository", value: repo, icon: GitFork },
    { label: "Branch", value: event.branch || "main" },
    { label: "VCS Platform", value: provider },
    { label: "Event Type", value: eventType.replace("_", " ") },
    { label: "Timestamp", value: timestamp.toLocaleString(), icon: Calendar },
    { label: "Slack Status", value: event.slackStatus || "notified", icon: Radio },
  ];

  return (
    <div
      style={{
        padding: "24px 22px",
        height: "100%",
        overflowY: "auto",
        background: "var(--bg-card)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <Badge label={eventType.replace("_", " ")} color={EVENT_COLORS[eventType] || "var(--primary)"} />
            <Badge label={provider} color={PLATFORM_COLORS[provider] || "var(--text-secondary)"} />
          </div>

          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
              marginBottom: 4,
            }}
          >
            {eventType.replace("_", " ")} event
          </h2>

          <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
            {repo} {event.branch ? `· ${event.branch}` : ""}
          </div>
        </div>

        <button
          onClick={onClose}
          title="Close Inspector"
          style={{
            background: "var(--bg-card-subtle)",
            border: "1px solid var(--border-base)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            width: 30,
            height: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Metadata Table */}
      <div
        style={{
          border: "1px solid var(--border-base)",
          borderRadius: 12,
          background: "var(--bg-canvas)",
          overflow: "hidden",
        }}
      >
        {detailRows.map((row, idx) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "11px 16px",
              borderBottom: idx === detailRows.length - 1 ? "none" : "1px solid var(--border-base)",
              fontSize: 12,
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: 11,
              }}
            >
              {row.label}
            </span>

            <span
              style={{
                color: "var(--text-primary)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Webhook Raw Payload Accordion */}
      <div
        style={{
          border: "1px solid var(--border-base)",
          borderRadius: 12,
          background: "var(--bg-canvas)",
          overflow: "hidden",
        }}
      >
        <div
          onClick={() => setIsPayloadExpanded(!isPayloadExpanded)}
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            background: "var(--bg-card-subtle)",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Code2 size={15} color="var(--primary)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Webhook Payload Preview
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-base)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 11,
                color: copied ? "var(--success)" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            {isPayloadExpanded ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
          </div>
        </div>

        {isPayloadExpanded && (
          <div
            style={{
              padding: "14px 16px",
              background: "var(--bg-input)",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            <pre
              style={{
                margin: 0,
                fontSize: 11,
                color: "var(--text-secondary)",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {rawJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}