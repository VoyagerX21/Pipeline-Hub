import { useEffect, useState } from "react";
import { EVENT_COLORS, PLATFORM_COLORS } from "../constants.jsx";
import {
  Activity,
  FolderGit2,
  Users,
  Radio,
  Loader2,
  GitCommit,
  GitPullRequest,
  GitMerge,
  ArrowDownCircle,
} from "lucide-react";

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : (n ?? 0));

function DonutChart({ slices, size = 120, thickness = 20 }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const total = slices.reduce((s, sl) => s + (sl.value || 0), 0);

  const arcs = [];
  let currentOffset = 0;
  for (const sl of slices) {
    const pct = total ? sl.value / total : 0;
    const dash = pct * circ;
    arcs.push({
      ...sl,
      dash,
      gap: circ - dash,
      offset: circ - currentOffset,
    });
    currentOffset += dash;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={thickness} />
      {arcs.map((arc, i) =>
        arc.value > 0 ? (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        ) : null
      )}
    </svg>
  );
}

function HBar({ label, count, color, total, Icon }) {
  const pct = total ? Math.max((count / total) * 100, 0) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            fontFamily: "'JetBrains Mono', monospace",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 500,
          }}
        >
          {Icon && <Icon size={14} color={color} />}
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
            {pct.toFixed(1)}%
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "'JetBrains Mono', monospace",
              background: "var(--bg-card-subtle)",
              borderRadius: 4,
              padding: "1px 7px",
            }}
          >
            {fmt(count)}
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: "var(--border-subtle)", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <div
      style={{
        background: "var(--bg-card-subtle)",
        borderRadius: 10,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${accent}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={16} color={accent} />
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "var(--text-primary)",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "-0.5px",
          lineHeight: 1.1,
        }}
      >
        {fmt(value)}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

function VBarChart({ data, height = 90 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, padding: "8px 0" }}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * (height - 30), d.value > 0 ? 6 : 0);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
              {fmt(d.value)}
            </span>
            <div
              style={{
                width: "100%",
                maxWidth: 44,
                height: h,
                borderRadius: "4px 4px 0 0",
                background: d.color,
                transition: "height 0.8s ease",
              }}
            />
            <span style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ title, accent = "var(--primary)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: accent }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
        {title}
      </span>
    </div>
  );
}

const AVATAR_COLORS = ["#2563eb", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"];
const TYPE_ICONS = {
  push: GitCommit,
  pull_request: GitPullRequest,
  merge: GitMerge,
  pull: ArrowDownCircle,
};

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${window.__ENV__.VITE_API_URL}/analytics/user`, { credentials: "include" });
        const data = await res.json();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          color: "var(--text-muted)",
          height: "100%",
        }}
      >
        <Loader2 size={32} color="var(--primary)" style={{ animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Loading analytics stream…</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)", fontSize: 13 }}>
        Unable to load analytics at this time.
      </div>
    );
  }

  const platforms = ["github", "gitlab", "bitbucket"].map((p) => ({
    name: p,
    value: analytics.platforms?.[p] ?? 0,
    color: PLATFORM_COLORS[p] ?? "var(--primary)",
  }));

  const types = ["push", "pull_request", "merge", "pull"].map((t) => ({
    name: t,
    value: analytics.types?.[t] ?? 0,
    color: EVENT_COLORS[t] ?? "var(--text-muted)",
    icon: TYPE_ICONS[t],
  }));

  const activePlatforms = platforms.filter((p) => p.value > 0).length;
  const donutSlices = platforms.map((p) => ({ value: p.value, color: p.color, label: p.name }));
  const typeDonutSlices = types.map((t) => ({ value: t.value, color: t.color, label: t.name }));

  const typeBarData = types.map((t) => ({
    label: t.name.replace("_", " "),
    value: t.value,
    color: t.color,
  }));

  const totalEvents = analytics.totalEvents || 0;
  const topTotal = (analytics.topActors || []).reduce((s, a) => s + (a.count || 0), 0);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 28px",
        background: "var(--bg-app)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Header Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", margin: 0 }}>
            Unified VCS Intelligence
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {totalEvents.toLocaleString()} total events recorded across {activePlatforms} VCS provider{activePlatforms !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <MetricCard label="Total Events" value={totalEvents} sub="Lifetime stream" accent="var(--primary)" icon={Activity} />
        <MetricCard label="Tracked Repos" value={analytics.activeRepos} sub="Connected VCS repos" accent="#8b5cf6" icon={FolderGit2} />
        <MetricCard label="Contributors" value={analytics.contributors} sub="Unique actors & authors" accent="var(--success)" icon={Users} />
        <MetricCard label="Active Providers" value={activePlatforms} sub="GitHub · GitLab · Bitbucket" accent="var(--warning)" icon={Radio} />
      </div>

      {/* Distribution Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Platform Distribution Card */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 10,
            padding: 22,
          }}
        >
          <SectionHeader title="Platform Distribution" accent="var(--primary)" />
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <DonutChart slices={donutSlices} size={110} thickness={18} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(totalEvents)}
                </span>
                <span style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase" }}>Events</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 160 }}>
              {platforms.map((p) => (
                <HBar key={p.name} label={p.name.toUpperCase()} count={p.value} color={p.color} total={totalEvents} />
              ))}
            </div>
          </div>
        </div>

        {/* Event Type Share Card */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 10,
            padding: 22,
          }}
        >
          <SectionHeader title="Event Activity Types" accent="#8b5cf6" />
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <DonutChart slices={typeDonutSlices} size={110} thickness={18} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Types</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 160 }}>
              {types.map((t) => (
                <HBar key={t.name} label={t.name.replace("_", " ").toUpperCase()} count={t.value} color={t.color} total={totalEvents} Icon={t.icon} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Breakdown Bar Chart */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 10,
            padding: "22px 24px",
          }}
        >
        <SectionHeader title="Volume Breakdown by Event Type" accent="var(--success)" />
        <VBarChart data={typeBarData} height={110} />
      </div>

      {/* Top Contributors Card */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 10,
            padding: 22,
          }}
        >
        <SectionHeader title="Top Active Contributors" accent="var(--warning)" />
        {(!analytics.topActors || analytics.topActors.length === 0) ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            No contributor activity recorded yet.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
            {analytics.topActors.map((a, i) => {
              const pct = topTotal ? (a.count / topTotal) * 100 : 0;
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const initials = a.name
                .split(/[\s._-]+/)
                .filter(Boolean)
                .map((n) => n[0].toUpperCase())
                .join("")
                .slice(0, 2) || "U";

              return (
                <div
                  key={a.name}
                  style={{
                    background: "var(--bg-card-subtle)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      fontSize: 11,
                      fontWeight: 700,
                      color: i === 0 ? "var(--warning)" : "var(--text-muted)",
                      fontFamily: "'JetBrains Mono', monospace",
                      textAlign: "center",
                    }}
                  >
                    #{i + 1}
                  </div>

                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: `${color}18`,
                      border: `1.5px solid ${color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color,
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.name}
                    </div>
                    <div style={{ marginTop: 4, height: 3, background: "var(--border-base)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmt(a.count)}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{pct.toFixed(0)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}