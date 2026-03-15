import { useState, useEffect, useCallback } from "react";
import Badge from "./Badge.jsx";
import { EVENT_COLORS, timeAgo } from "../constants.jsx";

const API = {
  summary: "/webhookPanel/dashboard/summary",
  activity: "/webhookPanel/dashboard/activity",
  recent: "/webhookPanel/dashboard/recent",
  health: "/webhookPanel/dashboard/health",
  webhooks: "/webhookPanel/webhooks",
};

async function apiFetch(url) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    method: "GET",
    credentials: 'include'
  });
  if (!res.ok) throw new Error();
  return res.json();
}

function StatCard({ label, value, accent = "#3b82f6", loading }) {
  return (
    <div style={{
      background: "#0a0d14",
      border: "1px solid #1e2330",
      borderRadius: 10,
      padding: "18px 20px",
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{
        fontSize: 11,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: "1px",
        fontWeight: 700,
        marginBottom: 8
      }}>
        {label}
      </div>

      {loading ? (
        <div style={{
          height: 28,
          width: "60%",
          borderRadius: 5,
          background: "#1e2330",
          animation: "pulse 1.4s infinite"
        }} />
      ) : (
        <div style={{
          fontSize: 26,
          fontWeight: 800,
          color: accent,
          fontFamily: "monospace"
        }}>
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
              height: `${30 + Math.random() * 30}%`
            }}
          />
        ))}
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 70 }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4
          }}
        >
          <div
            title={`${d.date}: ${d.count}`}
            style={{
              width: "100%",
              height: `${Math.max(4, (d.count / max) * 52)}px`,
              background: "linear-gradient(to top,#3b82f6,#60a5fa)",
              borderRadius: "3px 3px 0 0",
              transition: "height 0.3s ease"
            }}
          />

          <span
            style={{
              fontSize: 9,
              color: "#334155",
              fontFamily: "monospace"
            }}
          >
            {d.date}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeedItem({ item }) {
  const success = item.status === "success";

  return (
    <div style={{
      display: "flex",
      gap: 10,
      padding: "10px 0",
      borderBottom: "1px solid #0f1420"
    }}>
      <div style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: success ? "#10b981" : "#ef4444",
        marginTop: 5
      }} />

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          <span style={{ color: "#60a5fa" }}>{item.event}</span>
          {" → "}
          <span style={{ color: success ? "#10b981" : "#ef4444" }}>
            {success ? "Notification sent" : "Notification failed"}
          </span>
        </div>

        <div style={{
          fontSize: 10,
          color: "#334155",
          fontFamily: "monospace"
        }}>
          {timeAgo(new Date(item.time))}
        </div>
      </div>
    </div>
  );
}

function WebhookCard({ wh }) {
  return (
    <div style={{
      background: "#0a0d12",
      border: "1px solid #1e2330",
      borderRadius: 10,
      padding: 18,
      marginBottom: 12
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}>
        <div style={{ fontWeight: 700 }}>{wh.name}</div>
        <span style={{
          fontSize: 11,
          color: wh.status === "active" ? "#10b981" : "#64748b"
        }}>
          {wh.status}
        </span>
      </div>

      <div style={{
        fontSize: 11,
        color: "#475569",
        fontFamily: "monospace",
        marginBottom: 10
      }}>
        {wh.url}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {(wh.events || []).map(ev => (
          <Badge key={ev} label={ev} color={EVENT_COLORS[ev]} />
        ))}
      </div>
    </div>
  );
}

export default function WebhooksPanel() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [recent, setRecent] = useState([]);
  const [health, setHealth] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);

    try {
      const [s, a, r, h, w] = await Promise.all([
        apiFetch(API.summary),
        apiFetch(API.activity),
        apiFetch(API.recent),
        apiFetch(API.health),
        apiFetch(API.webhooks),
      ]);

      setSummary(s);
      setActivity(a);
      setRecent(r);
      setHealth(h);
      setWebhooks(w);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    loadAll();

    // auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadAll();
    }, 30000);

    // cleanup
    return () => clearInterval(interval);
  }, [loadAll]);

  return (
    <>
      <style>{`
      @keyframes blink {
        0%,100%{opacity:1}
        50%{opacity:.35}
      }
    `}</style>
      <div style={{
        padding: 24,
        fontFamily: "'DM Mono', monospace"
      }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            Slack Notifications
          </div>

          <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
            Activity & monitoring dashboard
          </div>

          <div
            style={{
              // backgroundColor: "red",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              fontSize: 11,
              color: "#64748b",
              fontFamily: "monospace"
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b98188",
                animation: "blink 2.5s infinite"
              }}
            />
            <span style={{ color: "#10b981", fontWeight: 700 }}>LIVE</span>
            <span>Listening for webhook events</span>
            <span style={{ color: "#334155" }}>•</span>
            <span>Auto refresh every 30s</span>
          </div>
        </div>

        {/* Health */}
        <div style={{
          background: "#0a0d14",
          border: "1px solid #1e2330",
          borderRadius: 10,
          padding: 14,
          marginBottom: 20
        }}>
          <b>Automation Health</b>
          <div style={{ fontSize: 12, marginTop: 5 }}>
            Last notification: {health?.lastNotification ? timeAgo(new Date(health.lastNotification)) : "—"}
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatCard label="Notifications Sent" value={summary?.totalSent} loading={loading} />
          <StatCard label="Success Rate" value={summary?.successRate} accent="#10b981" loading={loading} />
          <StatCard label="Active Webhooks" value={summary?.activeWebhooks} accent="#8b5cf6" loading={loading} />
          <StatCard label="Failures (24h)" value={summary?.failures24h} accent="#ef4444" loading={loading} />
        </div>

        {/* Activity */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, marginBottom: 8, color: "#475569" }}>
            Activity (Last 7 Days)
          </div>
          <MiniBarChart data={activity} loading={loading} />
        </div>

        {/* Feed */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, marginBottom: 8, color: "#475569" }}>
            Recent Notifications
          </div>

          {recent.map(r => (
            <FeedItem key={r.id} item={r} />
          ))}
        </div>

        {/* Webhooks */}
        <div style={{ marginTop: 28 }}>
          <div style={{
            fontSize: 11,
            color: "#475569",
            marginBottom: 12
          }}>
            Webhooks
          </div>

          {webhooks.map(w => (
            <WebhookCard key={w.id} wh={w} />
          ))}
        </div>
      </div>
    </>
  );
}