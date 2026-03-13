import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/UserContext.jsx";
import StatCard from "./StatCard.jsx";
import Avatar from "./Avatar.jsx";
import { EVENT_COLORS, PLATFORM_COLORS } from "../constants.jsx";

/* ─── tiny helpers ─────────────────────────────────────────── */
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);

/* ─── Donut Chart (SVG, no deps) ───────────────────────────── */
function DonutChart({ slices, size = 120, thickness = 22 }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;

  let offset = 0;
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const arcs = slices.map((sl) => {
    const pct = total ? sl.value / total : 0;
    const dash = pct * circ;
    const arc = { ...sl, dash, gap: circ - dash, offset: circ - offset };
    offset += dash;
    return arc;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2035" strokeWidth={thickness} />
      {arcs.map((arc, i) =>
        arc.value > 0 ? (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={arc.color} strokeWidth={thickness}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
          />
        ) : null
      )}
    </svg>
  );
}

/* ─── Sparkline (mini SVG line) ────────────────────────────── */
function Sparkline({ data, color = "#3b82f6", w = 80, h = 28 }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Horizontal bar ───────────────────────────────────────── */
function HBar({ label, count, color, total, icon }) {
  const pct = total ? Math.max((count / total) * 100, 0) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
          {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{pct.toFixed(1)}%</span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#f1f5f9",
            fontFamily: "'JetBrains Mono', monospace",
            background: "#0f1623", border: "1px solid #1e2a3a",
            borderRadius: 4, padding: "1px 7px"
          }}>{fmt(count)}</span>
        </div>
      </div>
      <div style={{ height: 5, background: "#0f1623", borderRadius: 99, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: 99, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 6px ${color}66`
        }} />
      </div>
    </div>
  );
}

/* ─── Metric Card ───────────────────────────────────────────── */
function MetricCard({ label, value, sub, accent, icon, spark }) {
  return (
    <div style={{
      background: "linear-gradient(145deg, #0c1220, #0a0f1a)",
      border: `1px solid ${accent}28`,
      borderRadius: 12, padding: "18px 20px",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", gap: 4
    }}>
      {/* glow blob */}
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: accent, opacity: 0.07, filter: "blur(24px)"
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 18, opacity: 0.8 }}>{icon}</span>
        {spark && <Sparkline data={spark} color={accent} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-1px", lineHeight: 1.1 }}>
        {fmt(value)}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "1.2px" }}>{label}</div>
      <div style={{ fontSize: 10, color: "#475569" }}>{sub}</div>
    </div>
  );
}

/* ─── Vertical Bar Chart ────────────────────────────────────── */
function VBarChart({ data, height = 80 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * height, d.value > 0 ? 4 : 0);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>{fmt(d.value)}</div>
            <div style={{
              width: "100%", height: h, borderRadius: "3px 3px 0 0",
              background: `linear-gradient(180deg, ${d.color}, ${d.color}99)`,
              boxShadow: `0 0 8px ${d.color}44`,
              transition: "height 0.8s cubic-bezier(0.4,0,0.2,1)"
            }} />
            <div style={{ fontSize: 8, color: "#334155", fontFamily: "monospace", textAlign: "center" }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Section Header ────────────────────────────────────────── */
function SectionHeader({ title, accent = "#3b82f6" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: accent }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1.4px" }}>{title}</span>
    </div>
  );
}

/* ─── Divider ───────────────────────────────────────────────── */
const Divider = () => (
  <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #1e2a3a, transparent)", margin: "24px 0" }} />
);

const AVATAR_COLORS = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#ef4444"];
const PLATFORM_ICONS = { github: "⬡", gitlab: "◈", bitbucket: "◉" };
const TYPE_ICONS = { push: "↑", pull_request: "⇄", merge: "⊕", pull: "↓" };

/* ══════════════════════════════════════════════════════════════
   MAIN PANEL
══════════════════════════════════════════════════════════════ */
export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/user`, { credentials: "include" });
        const data = await res.json();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 14, color: "#475569"
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "2px solid #1e2a3a", borderTop: "2px solid #3b82f6",
        animation: "spin 0.8s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 12, fontFamily: "monospace" }}>Loading analytics…</span>
    </div>
  );

  if (!analytics) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 12 }}>
      Failed to load analytics.
    </div>
  );

  /* ── derived data ── */
  const platforms = ["github", "gitlab", "bitbucket"].map((p) => ({
    name: p, value: analytics.platforms[p] ?? 0,
    color: PLATFORM_COLORS[p] ?? "#3b82f6",
    icon: PLATFORM_ICONS[p]
  }));

  const types = ["push", "pull_request", "merge", "pull"].map((t) => ({
    name: t, value: analytics.types[t] ?? 0,
    color: EVENT_COLORS[t] ?? "#94a3b8",
    icon: TYPE_ICONS[t]
  }));

  const activePlatforms = platforms.filter((p) => p.value > 0).length;

  const donutSlices = platforms.map((p) => ({ value: p.value, color: p.color, label: p.name }));
  const typeDonutSlices = types.map((t) => ({ value: t.value, color: t.color, label: t.name }));

  const typeBarData = types.map((t) => ({
    label: t.name.replace("_", " ").split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join("\n"),
    value: t.value, color: t.color
  }));

  const totalEvents = analytics.totalEvents || 0;
  const topTotal = analytics.topActors.reduce((s, a) => s + a.count, 0);

  /* ─── render ─── */
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px", background: "#060a10" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.4px", fontFamily: "'JetBrains Mono', monospace" }}>
            Analytics Dashboard
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", paddingLeft: 28 }}>
          {totalEvents.toLocaleString()} total events across {activePlatforms} platform{activePlatforms !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <MetricCard label="Total Events" value={totalEvents} sub="all time" accent="#3b82f6" icon="⚡" />
        <MetricCard label="Active Repos" value={analytics.activeRepos} sub="unique repos" accent="#a855f7" icon="📁" />
        <MetricCard label="Contributors" value={analytics.contributors} sub="unique actors" accent="#10b981" icon="👥" />
        <MetricCard label="Platforms" value={activePlatforms} sub="gh · gl · bb" accent="#f59e0b" icon="🔗" />
      </div>

      <Divider />

      {/* ── Platform Distribution ── */}
      <SectionHeader title="Platform Distribution" accent="#3b82f6" />
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
        {/* donut */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <DonutChart slices={donutSlices} size={110} thickness={20} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", pointerEvents: "none"
          }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9", fontFamily: "monospace", lineHeight: 1 }}>{fmt(totalEvents)}</span>
            <span style={{ fontSize: 8, color: "#334155", letterSpacing: "1px", textTransform: "uppercase" }}>events</span>
          </div>
        </div>
        {/* legend bars */}
        <div style={{ flex: 1 }}>
          {platforms.map((p) => (
            <HBar key={p.name} label={p.name} count={p.value} color={p.color} total={totalEvents} icon={p.icon} />
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Event Types ── */}
      <SectionHeader title="Event Types" accent="#a855f7" />

      {/* vertical bar chart */}
      <div style={{
        background: "linear-gradient(145deg, #0c1220, #0a0f1a)",
        border: "1px solid #1e2a3a", borderRadius: 12, padding: "16px 18px", marginBottom: 16
      }}>
        <VBarChart data={typeBarData} height={72} />
      </div>

      {/* horizontal bars */}
      <div style={{ marginBottom: 24 }}>
        {types.map((t) => (
          <HBar key={t.name} label={t.name.replace("_", " ")} count={t.value} color={t.color} total={totalEvents} icon={t.icon} />
        ))}
      </div>

      <Divider />

      {/* ── Type Breakdown donut + legend ── */}
      <SectionHeader title="Type Share" accent="#10b981" />
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <DonutChart slices={typeDonutSlices} size={90} thickness={16} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", pointerEvents: "none"
          }}>
            <span style={{ fontSize: 8, color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>types</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {types.filter((t) => t.value > 0).map((t) => {
            const pct = totalEvents ? ((t.value / totalEvents) * 100).toFixed(1) : "0.0";
            return (
              <div key={t.name} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#0a0f1a", border: `1px solid ${t.color}30`,
                borderRadius: 6, padding: "5px 10px"
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{t.name.replace("_", " ")}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.color, fontFamily: "monospace" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* ── Top Contributors ── */}
      <SectionHeader title="Top Contributors" accent="#f59e0b" />
      {analytics.topActors.length === 0 ? (
        <div style={{ fontSize: 12, color: "#334155", fontFamily: "monospace", textAlign: "center", padding: "20px 0" }}>
          No contributors yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {analytics.topActors.map((a, i) => {
            const pct = topTotal ? (a.count / topTotal) * 100 : 0;
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const initials = a.name.split(/[\s.]/).filter(Boolean).map((n) => n[0].toUpperCase()).join("").slice(0, 2);
            return (
              <div key={a.name} style={{
                background: "linear-gradient(135deg, #0c1220, #0a0f1a)",
                border: "1px solid #1a2435",
                borderRadius: 10, padding: "12px 14px",
                position: "relative", overflow: "hidden"
              }}>
                {/* rank fill bar */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${pct}%`, background: `${color}08`,
                  transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)"
                }} />
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
                  {/* rank */}
                  <div style={{
                    width: 20, textAlign: "center",
                    fontSize: 9, color: i === 0 ? "#f59e0b" : "#334155",
                    fontFamily: "monospace", fontWeight: 800
                  }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </div>
                  {/* avatar */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${color}22`, border: `1.5px solid ${color}66`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color, fontFamily: "monospace", flexShrink: 0
                  }}>
                    {initials || "?"}
                  </div>
                  {/* name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.name}
                    </div>
                    {/* mini bar */}
                    <div style={{ marginTop: 4, height: 2, background: "#0f1623", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 99, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>
                  </div>
                  {/* count */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", fontFamily: "monospace" }}>{fmt(a.count)}</div>
                    <div style={{ fontSize: 9, color: "#334155" }}>{pct.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* bottom spacer */}
      <div style={{ height: 24 }} />
    </div>
  );
}