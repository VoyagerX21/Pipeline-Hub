import { useState, useEffect, useCallback } from "react";
import Badge from "./Badge.jsx";
import { EVENT_COLORS, timeAgo } from "../constants.jsx";
import {
  Webhook,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Globe,
  User,
  Loader2,
} from "lucide-react";

const MOBILE_BREAKPOINT = 1100;
const RECENT_PAGE_SIZE = 5;

const API = {
  summary: "/webhookPanel/dashboard/summary",
  activity: "/webhookPanel/dashboard/activity",
  recent: "/webhookPanel/dashboard/recent",
  health: "/webhookPanel/dashboard/health",
  webhooks: "/webhookPanel/webhooks",

  personalSummary: "/webhookPanel/personal-dashboard/summary",
  personalActivity: "/webhookPanel/personal-dashboard/activity",
  personalHealth: "/webhookPanel/personal-dashboard/health",
  personalRecent: "/webhookPanel/personal-dashboard/recent",
  personalWebhooks: "/webhookPanel/webhooks",
};

async function apiFetch(url) {
  const res = await fetch(`${window.__ENV__.VITE_API_URL}${url}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}

function StatBox({ label, value, accent = "var(--primary)", loading }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 10,
        padding: "16px 18px",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      {loading ? (
        <div style={{ height: 26, width: "50%", background: "var(--bg-card-subtle)", borderRadius: 6 }} />
      ) : (
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: accent,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "-0.5px",
          }}
        >
          {value ?? "—"}
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ data = [], loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", gap: 6, height: 60, alignItems: "flex-end" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: "40%", background: "var(--bg-card-subtle)", borderRadius: "3px 3px 0 0" }} />
        ))}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count || 0), 1);

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 75, padding: "6px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            title={`${d.date}: ${d.count} notifications`}
            style={{
              width: "100%",
              maxWidth: 32,
              height: `${Math.max(4, ((d.count || 0) / max) * 50)}px`,
              background: "var(--primary)",
              borderRadius: "3px 3px 0 0",
              transition: "height 0.3s ease",
            }}
          />
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
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
        gap: 12,
        padding: "11px 0",
        borderBottom: "1px solid var(--border-subtle)",
        alignItems: "flex-start",
      }}
    >
      <div style={{ marginTop: 2, flexShrink: 0 }}>
        {success ? <CheckCircle2 size={16} color="var(--success)" /> : <XCircle size={16} color="var(--danger)" />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
          <span style={{ color: "var(--primary)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            {item.event}
          </span>
          {" → "}
          <span style={{ color: success ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
            {success ? "Slack delivered" : "Delivery failed"}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
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
        background: "var(--bg-card-subtle)",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{wh.name}</div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: wh.status === "active" ? "var(--success)" : "var(--text-muted)",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {wh.status}
        </span>
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 10,
          wordBreak: "break-all",
        }}
      >
        {wh.url}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(wh.events || []).map((ev) => (
          <Badge key={ev} label={ev} color={EVENT_COLORS[ev] || "var(--primary)"} />
        ))}
      </div>
    </div>
  );
}

function SectionWrapper({ title, subtitle, open, onToggle, accent = "var(--primary)", icon: Icon, children }) {
  return (
    <div
      style={{
        borderRadius: 10,
        background: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        type="button"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          background: "var(--bg-card)",
          border: "none",
          borderBottom: open ? "1px solid var(--border-subtle)" : "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${accent}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            flexShrink: 0,
          }}
        >
          {Icon && <Icon size={16} />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>}
        </div>

        {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>

      {open && <div style={{ padding: "20px 22px" }}>{children}</div>}
    </div>
  );
}

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
        apiFetch(API.summary).catch(() => ({ totalSent: 0, successRate: "100%", activeWebhooks: 0, failures24h: 0 })),
        apiFetch(API.activity).catch(() => []),
        apiFetch(API.health).catch(() => ({ lastNotification: null })),
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Automation Health Card */}
      <div
        style={{
          background: "var(--bg-card-subtle)",
          borderRadius: 10,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} color="var(--success)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Platform Health Status</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
          Last notification: {health?.lastNotification ? timeAgo(new Date(health.lastNotification), now) : "None yet"}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <StatBox label="Total Dispatched" value={summary?.totalSent} loading={loading} />
        <StatBox label="Success Rate" value={summary?.successRate} accent="var(--success)" loading={loading} />
        <StatBox label="Active Endpoints" value={summary?.activeWebhooks} accent="#8b5cf6" loading={loading} />
        <StatBox label="Failures (24h)" value={summary?.failures24h} accent="var(--danger)" loading={loading} />
      </div>

      {/* 7-Day Activity */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
          Dispatched Events (Last 7 Days)
        </div>
        <MiniBarChart data={activity} loading={loading} />
      </div>
    </div>
  );
}

function PersonalDashboard() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState(null);
  const [recent, setRecent] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [recentPage, setRecentPage] = useState(1);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, h, r, w] = await Promise.all([
        apiFetch(API.personalSummary).catch(() => ({ totalSent: 0, successRate: "100%", activeWebhooks: 0, failures24h: 0 })),
        apiFetch(API.personalActivity).catch(() => []),
        apiFetch(API.personalHealth).catch(() => ({ lastNotification: null })),
        apiFetch(API.personalRecent).catch(() => []),
        apiFetch(API.personalWebhooks).catch(() => []),
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Automation Health */}
      <div
        style={{
          background: "var(--bg-card-subtle)",
          borderRadius: 10,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} color="var(--success)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Your Channel Health</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
          Last notification: {health?.lastNotification ? timeAgo(new Date(health.lastNotification), now) : "None yet"}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <StatBox label="Sent to Slack" value={summary?.totalSent} loading={loading} />
        <StatBox label="Success Rate" value={summary?.successRate} accent="var(--success)" loading={loading} />
        <StatBox label="Endpoints" value={summary?.activeWebhooks} accent="#8b5cf6" loading={loading} />
        <StatBox label="Errors (24h)" value={summary?.failures24h} accent="var(--danger)" loading={loading} />
      </div>

      {/* 7-Day Activity */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
          Your Activity Stream (Last 7 Days)
        </div>
        <MiniBarChart data={activity} loading={loading} />
      </div>

      {/* Recent Notifications Feed */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
          Recent Notifications
        </div>

        {paginatedRecent.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "12px 0" }}>
            No recent Slack notifications.
          </div>
        ) : (
          paginatedRecent.map((r) => <FeedItem key={r.id} item={r} now={now} />)
        )}

        {hasMore && (
          <button
            onClick={() => setRecentPage((p) => p + 1)}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "8px 0",
              background: "var(--bg-card-subtle)",
              borderRadius: 8,
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Show {recent.length - paginatedRecent.length} more notifications
          </button>
        )}
      </div>

      {/* Configured Webhooks */}
      {webhooks.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
            Configured Webhooks
          </div>
          {webhooks.map((w) => (
            <WebhookCard key={w.id} wh={w} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WebhooksPanel() {
  const [personalOpen, setPersonalOpen] = useState(true);
  const [globalOpen, setGlobalOpen] = useState(true);

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        overflowY: "auto",
        padding: "24px 28px",
        background: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", margin: 0 }}>
            Slack Automation & Webhook Intelligence
          </h2>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
          Real-time webhook ingestion and automated Slack channel delivery monitoring
        </p>
      </div>

      {/* Grid containing Personal and Global Dashboards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <SectionWrapper
          title="Personal Automation Dashboard"
          subtitle="Your individual Slack notifications, events & triggers"
          open={personalOpen}
          onToggle={() => setPersonalOpen(!personalOpen)}
          accent="var(--primary)"
          icon={User}
        >
          <PersonalDashboard />
        </SectionWrapper>

        <SectionWrapper
          title="Global System Dashboard"
          subtitle="Platform-wide webhook throughput & reliability metrics"
          open={globalOpen}
          onToggle={() => setGlobalOpen(!globalOpen)}
          accent="#8b5cf6"
          icon={Globe}
        >
          <GlobalDashboard />
        </SectionWrapper>
      </div>
    </div>
  );
}