import Badge from "./Badge.jsx";
import { MOCK_EVENTS, EVENT_COLORS, PLATFORM_COLORS, timeAgo } from "../constants.jsx";

export default function ReposPanel() {
  const repos = [...new Set(MOCK_EVENTS.map(e => e.repo))].map(repo => {
    const events = MOCK_EVENTS.filter(e => e.repo === repo);
    const platforms = [...new Set(events.map(e => e.platform))];
    const lastEvent = [...events].sort((a, b) => b.ts - a.ts)[0];
    return { repo, events, platforms, lastEvent };
  }).sort((a, b) => b.lastEvent.ts - a.lastEvent.ts);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 6, letterSpacing: "-0.3px" }}>
        Repositories
      </div>
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 24 }}>
        {repos.length} repositories tracked
      </div>

      {repos.map(({ repo, events, platforms, lastEvent }) => (
        <div
          key={repo}
          style={{
            background: "#0a0d12", border: "1px solid #1e2330",
            borderRadius: 10, padding: 18, marginBottom: 12,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2330"}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace", marginBottom: 4 }}>
                {repo}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {platforms.map(p => (
                  <span key={p} style={{
                    fontSize: 10, color: PLATFORM_COLORS[p],
                    background: `${PLATFORM_COLORS[p]}18`, border: `1px solid ${PLATFORM_COLORS[p]}30`,
                    borderRadius: 3, padding: "1px 6px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.5px"
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {events.length}
              </div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>events</div>
            </div>
          </div>

          {/* Event type breakdown */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {Object.entries(
              events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {})
            ).map(([type, count]) => (
              <Badge key={type} label={`${type.replace("_", " ")} ×${count}`} color={EVENT_COLORS[type]} />
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #1e2330" }}>
            <div style={{ fontSize: 12, color: "#475569" }}>
              Last:{" "}
              <span style={{ color: "#64748b", fontFamily: "monospace" }}>
                {lastEvent.message.slice(0, 42)}{lastEvent.message.length > 42 ? "…" : ""}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
              {timeAgo(lastEvent.ts)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}