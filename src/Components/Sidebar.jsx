import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Avatar from "./Avatar";

const NAV_ITEMS = [
  { id: "events",    path: "/events",    icon: "⬡", label: "Events" },
  { id: "analytics", path: "/analytics", icon: "◈", label: "Analytics" },
  { id: "repos",     path: "/repos",     icon: "⬢", label: "Repos" },
  { id: "webhooks",  path: "/webhooks",  icon: "⟐", label: "Webhooks" },
];

export default function Sidebar({ sidePanel, setSidePanel }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const { user } = useContext(UserContext);
  // console.log(user);

  return (
    <div style={{
      width: 56, background: "#0a0d12", borderRight: "1px solid #1e2330",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 0", gap: 4, flexShrink: 0, zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 16, color: "#3b82f6", fontSize: 22, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>
        V
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map(item => {
        const active = pathname.startsWith(item.path);
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            title={item.label}
            style={{
              width: 40, height: 40, borderRadius: 8, border: "none",
              background: active ? "#1a2035" : "transparent",
              color: active ? "#3b82f6" : "#334155",
              cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
              borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#64748b"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#334155"; }}
          >
            {item.icon}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Profile button */}
      <button
        onClick={() => setSidePanel(sidePanel === "profile" ? null : "profile")}
        title="Profile"
        style={{
          width: 34, height: 34, borderRadius: "50%",
          background: sidePanel === "profile" ? "#3b82f6" : "#1e2330",
          border: `2px solid ${sidePanel === "profile" ? "#3b82f6" : "#334155"}`,
          color: "#e2e8f0", fontWeight: 800, fontSize: 12, cursor: "pointer",
          fontFamily: "monospace", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Avatar avatarURL={user.avatarUrl} />
      </button>
    </div>
  );
}