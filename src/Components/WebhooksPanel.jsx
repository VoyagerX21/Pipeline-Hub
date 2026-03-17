import { useState, useEffect, useCallback } from "react";
import Badge from "./Badge.jsx";
import { EVENT_COLORS, timeAgo } from "../constants.jsx";

const API = {
  // Global dashboard
  summary: "/webhookPanel/dashboard/summary",
  activity: "/webhookPanel/dashboard/activity",
  recent: "/webhookPanel/dashboard/recent",
  health: "/webhookPanel/dashboard/health",
  webhooks: "/webhookPanel/webhooks",

  // Personal dashboard
  personalSummary: "/webhookPanel/personal-dashboard/summary",
  personalActivity: "/webhookPanel/personal-dashboard/activity",
  personalHealth: "/webhookPanel/personal-dashboard/health",
  personalRecent: "/webhookPanel/dashboard/recent",
  personalWebhooks: "/webhookPanel/webhooks",
};

const RECENT_PAGE_SIZE = 5;

async function apiFetch(url) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error();
  return res.json();
}

/* ─── Shared sub-components ──────────────────────────────────────────── */

function StatCard({ label, value, accent = "#3b82f6", loading }) {
  return (
    <div
      style={{
        background: "#0a0d14",
        border: "1px solid #1e2330",
        borderRadius: 10,
        padding: "18px 20px",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      {loading ? (
        <div
          style={{
            height: 28,
            width: "60%",
            borderRadius: 5,
            background: "#1e2330",
            animation: "pulse 1.4s infinite",
          }}
        />
      ) : (
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: accent,
            fontFamily: "monospace",
          }}
        >
          {value ?? "—"}
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ data, loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", gap: 6, height: 60 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 32,
              background: "#1e2330",
              borderRadius: "3px 3px 0 0",
              animation: "pulse 1.4s infinite",
              height: `${30 + Math.random() * 30}%`,
            }}
          />
        ))}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div
      style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 70 }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            title={`${d.date}: ${d.count}`}
            style={{
              width: "100%",
              height: `${Math.max(4, (d.count / max) * 52)}px`,
              background: "linear-gradient(to top,#3b82f6,#60a5fa)",
              borderRadius: "3px 3px 0 0",
              transition: "height 0.3s ease",
            }}
          />
          <span
            style={{ fontSize: 9, color: "#334155", fontFamily: "monospace" }}
          >
            {d.date}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeedItem({ item, now }) {
  const success = item.status === "success";

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid #0f1420",
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: success ? "#10b981" : "#ef4444",
          marginTop: 5,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          <span style={{ color: "#60a5fa" }}>{item.event}</span>
          {" → "}
          <span style={{ color: success ? "#10b981" : "#ef4444" }}>
            {success ? "Notification sent" : "Notification failed"}
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#334155",
            fontFamily: "monospace",
          }}
        >
          {timeAgo(new Date(item.time), now)}
        </div>
      </div>
    </div>
  );
}

function WebhookCard({ wh }) {
  return (
    <div
      style={{
        background: "#0a0d12",
        border: "1px solid #1e2330",
        borderRadius: 10,
        padding: 18,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 700 }}>{wh.name}</div>
        <span
          style={{
            fontSize: 11,
            color: wh.status === "active" ? "#10b981" : "#64748b",
          }}
        >
          {wh.status}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#475569",
          fontFamily: "monospace",
          marginBottom: 10,
        }}
      >
        {wh.url}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {(wh.events || []).map((ev) => (
          <Badge key={ev} label={ev} color={EVENT_COLORS[ev]} />
        ))}
      </div>
    </div>
  );
}

/* ─── Section wrapper ─────────────────────────────────────────────────── */

function Section({ title, subtitle, open, onToggle, accent = "#3b82f6", children }) {
  return (
    <div
      className="webhooks-section"
      style={{
        border: "1px solid #1e2330",
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        background: "#080b11",
      }}
    >
      {/* Section header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          borderBottom: open ? "1px solid #1e2330" : "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* +/– icon */}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            border: `1px solid ${accent}44`,
            background: `${accent}11`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {open ? (
              /* minus */
              <line x1="1" y1="5" x2="9" y2="5" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              /* plus */
              <>
                <line x1="5" y1="1" x2="5" y2="9" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="5" x2="9" y2="5" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </div>

        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: "0.3px",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>
              {subtitle}
            </div>
          )}
        </div>
      </button>

      {/* Section body */}
      {open && (
        <div style={{ padding: "18px 18px 20px" }}>{children}</div>
      )}
    </div>
  );
}

/* ─── Global Dashboard ────────────────────────────────────────────────── */

function GlobalDashboard() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, h] = await Promise.all([
        apiFetch(API.summary),
        apiFetch(API.activity),
        apiFetch(API.health),
      ]);
      setSummary(s);
      setActivity(a);
      setHealth(h);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Health */}
      <div
        style={{
          background: "#0a0d14",
          border: "1px solid #1e2330",
          borderRadius: 10,
          padding: 14,
          marginBottom: 20,
        }}
      >
        <b>Automation Health</b>
        <div style={{ fontSize: 12, marginTop: 5 }}>
          Last notification:{" "}
          {health?.lastNotification
            ? timeAgo(new Date(health.lastNotification), now)
            : "—"}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatCard
          label="Notifications Sent"
          value={summary?.totalSent}
          loading={loading}
        />
        <StatCard
          label="Success Rate"
          value={summary?.successRate}
          accent="#10b981"
          loading={loading}
        />
        <StatCard
          label="Active Webhooks"
          value={summary?.activeWebhooks}
          accent="#8b5cf6"
          loading={loading}
        />
        <StatCard
          label="Failures (24h)"
          value={summary?.failures24h}
          accent="#ef4444"
          loading={loading}
        />
      </div>

      {/* Activity */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, marginBottom: 8, color: "#475569" }}>
          Activity (Last 7 Days)
        </div>
        <MiniBarChart data={activity} loading={loading} />
      </div>
    </>
  );
}

/* ─── Personal Dashboard ──────────────────────────────────────────────── */

function PersonalDashboard() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState(null);
  const [recent, setRecent] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Pagination state
  const [recentPage, setRecentPage] = useState(1);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, h, r, w] = await Promise.all([
        apiFetch(API.personalSummary),
        apiFetch(API.personalActivity),
        apiFetch(API.personalHealth),
        apiFetch(API.personalRecent),
        apiFetch(API.personalWebhooks),
      ]);
      setSummary(s);
      setActivity(a);
      setHealth(h);
      setRecent(r);
      setWebhooks(w);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const paginatedRecent = recent.slice(0, recentPage * RECENT_PAGE_SIZE);
  const hasMore = paginatedRecent.length < recent.length;

  return (
    <>
      {/* Health */}
      <div
        style={{
          background: "#0a0d14",
          border: "1px solid #1e2330",
          borderRadius: 10,
          padding: 14,
          marginBottom: 20,
        }}
      >
        <b>Automation Health</b>
        <div style={{ fontSize: 12, marginTop: 5 }}>
          Last notification:{" "}
          {health?.lastNotification
            ? timeAgo(new Date(health.lastNotification), now)
            : "—"}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatCard
          label="Notifications Sent"
          value={summary?.totalSent}
          loading={loading}
        />
        <StatCard
          label="Success Rate"
          value={summary?.successRate}
          accent="#10b981"
          loading={loading}
        />
        <StatCard
          label="Active Webhooks"
          value={summary?.activeWebhooks}
          accent="#8b5cf6"
          loading={loading}
        />
        <StatCard
          label="Failures (24h)"
          value={summary?.failures24h}
          accent="#ef4444"
          loading={loading}
        />
      </div>

      {/* Activity */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, marginBottom: 8, color: "#475569" }}>
          Activity (Last 7 Days)
        </div>
        <MiniBarChart data={activity} loading={loading} />
      </div>

      {/* Recent Notifications */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, marginBottom: 8, color: "#475569" }}>
          Recent Notifications
        </div>

        {paginatedRecent.map((r) => (
          <FeedItem key={r.id} item={r} now={now} />
        ))}

        {hasMore && (
          <button
            onClick={() => setRecentPage((p) => p + 1)}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "8px 0",
              background: "transparent",
              border: "1px solid #1e2330",
              borderRadius: 7,
              color: "#475569",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              letterSpacing: "0.5px",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.color = "#60a5fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1e2330";
              e.currentTarget.style.color = "#475569";
            }}
          >
            See more ({recent.length - paginatedRecent.length} remaining)
          </button>
        )}
      </div>

      {/* Webhooks */}
      {webhooks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
            Webhooks
          </div>
          {webhooks.map((w) => (
            <WebhookCard key={w.id} wh={w} />
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Root component ──────────────────────────────────────────────────── */

export default function WebhooksPanel() {
  const [personalOpen, setPersonalOpen] = useState(false);
  const [globalOpen, setGlobalOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes blink {
          0%,100%{opacity:1}
          50%{opacity:.35}
        }
        @keyframes pulse {
          0%,100%{opacity:1}
          50%{opacity:.4}
        }
        .webhooks-sections {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .webhooks-section {
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 768px) {
          .webhooks-sections {
            flex-direction: row;
            align-items: flex-start;
            gap: 16px;
          }
          .webhooks-section {
            margin-bottom: 0 !important;
          }
        }
      `}</style>

      <div
        style={{
          padding: 24,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            Slack Notifications
          </div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
            Activity & monitoring dashboard
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              fontSize: 11,
              color: "#64748b",
              fontFamily: "monospace",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b98188",
                animation: "blink 2.5s infinite",
              }}
            />
            <span style={{ color: "#10b981", fontWeight: 700 }}>LIVE</span>
            <span>Listening for webhook events</span>
            <span style={{ color: "#334155" }}>•</span>
            <span>Auto refresh every 30s</span>
          </div>
        </div>

        <div className="webhooks-sections">
          {/* Personal Dashboard Section */}
          <Section
            title="Personal Dashboard"
            subtitle="Your individual notifications, activity & webhooks"
            open={personalOpen}
            onToggle={() => setPersonalOpen((v) => !v)}
            accent="#3b82f6"
          >
            <PersonalDashboard />
          </Section>

          {/* Global Dashboard Section */}
          <Section
            title="Global Dashboard"
            subtitle="Platform-wide metrics & activity overview"
            open={globalOpen}
            onToggle={() => setGlobalOpen((v) => !v)}
            accent="#8b5cf6"
          >
            <GlobalDashboard />
          </Section>
        </div>
      </div>
    </>
  );
}