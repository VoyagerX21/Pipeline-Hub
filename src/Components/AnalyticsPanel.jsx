import StatCard from "./StatCard.jsx";
import Avatar from "./Avatar.jsx";
import { EVENT_COLORS, PLATFORM_COLORS } from "../constants.jsx";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext.jsx";

function BarRow({ label, count, color, total }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>{count}</span>
      </div>
      <div style={{ height: 6, background: "#1e2330", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${total ? (count / total) * 100 : 0}%`,
          background: color, borderRadius: 3,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
}

const AVATAR_COLORS = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/user`, {
        credentials: "include",
      });
      const data = await res.json();
      setAnalytics(data);
    };
    fetchAnalytics();
  }, []);

  if (!analytics) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }}>
      Loading analytics…
    </div>
  );

  const byPlatform = ["github", "gitlab", "bitbucket"].map(p => ({
    name: p, count: analytics.platforms[p] ?? 0,
  }));

  const byType = ["push", "pull_request", "merge", "pull"].map(t => ({
    name: t, count: analytics.types[t] ?? 0,
  }));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 6, letterSpacing: "-0.3px" }}>Analytics</div>
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 24 }}>
        {analytics.totalEvents} total events
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Events" value={analytics.totalEvents} sub="across all platforms" accent="#3b82f6" />
        <StatCard label="Active Repos" value={analytics.activeRepos} sub="unique repositories" accent="#a855f7" />
        <StatCard label="Contributors" value={analytics.contributors} sub="unique actors" accent="#10b981" />
        <StatCard label="Platforms" value={Object.values(analytics.platforms).filter(v => v > 0).length} sub="github · gitlab · bitbucket" accent="#f59e0b" />
      </div>

      {/* By platform */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 14 }}>
          Events by Platform
        </div>
        {byPlatform.map(p => (
          <BarRow key={p.name} label={p.name} count={p.count} color={PLATFORM_COLORS[p.name]} total={analytics.totalEvents} />
        ))}
      </div>

      {/* By type */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 14 }}>
          Events by Type
        </div>
        {byType.map(t => (
          <BarRow key={t.name} label={t.name.replace("_", " ")} count={t.count} color={EVENT_COLORS[t.name]} total={analytics.totalEvents} />
        ))}
      </div>

      {/* Top contributors */}
      <div>
        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 14 }}>
          Top Contributors
        </div>
        {analytics.topActors.map((a, i) => (
          <div key={a.name} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", marginBottom: 6,
            background: "#0a0d12", borderRadius: 8, border: "1px solid #1e2330"
          }}>
            <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", width: 16 }}>#{i + 1}</div>
            <Avatar
              initials={a.name.split(/[\s.]/).filter(Boolean).map(n => n[0].toUpperCase()).join("").slice(0, 2)}
              color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
              size={28}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>{a.name}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{a.count}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>events</div>
          </div>
        ))}
      </div>
    </div>
  );
}