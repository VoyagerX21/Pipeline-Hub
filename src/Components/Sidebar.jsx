import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { Activity, BarChart3, FolderGit2, Webhook, LogOut, Sun, Moon } from "lucide-react";
import { UserContext } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import Avatar from "./Avatar";

const NAV_ITEMS = [
  { id: "events", path: "/events", icon: Activity, label: "Live Events" },
  { id: "analytics", path: "/analytics", icon: BarChart3, label: "Analytics" },
  { id: "repos", path: "/repos", icon: FolderGit2, label: "Repositories" },
  { id: "webhooks", path: "/webhooks", icon: Webhook, label: "Webhooks & Automation" },
];

export default function Sidebar({ sidePanel, setSidePanel, changeUser }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useContext(UserContext);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch(`${window.__ENV__.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    changeUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <aside
      style={{
        width: 60,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: 8,
        flexShrink: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Icon */}
      <img
        src="./logo.png"
        onClick={() => navigate("/events")}
        title="PipelineHub"
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: 16,
          letterSpacing: "-0.5px",
          cursor: "pointer",
          marginBottom: 12,
        }}
      />

      {/* User Profile Trigger */}
      <button
        onClick={() => setSidePanel(sidePanel === "profile" ? null : "profile")}
        title="Profile & Settings"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          marginBottom: 12,
          outline: "none",
        }}
      >
        <Avatar avatarURL={user?.avatarUrl} name={user?.name || user?.email} size={34} />
      </button>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", alignItems: "center" }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              title={item.label}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "none",
                background: active ? "var(--primary-light)" : "transparent",
                color: active ? "var(--primary)" : "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Theme Switcher */}
      <button
        onClick={toggleTheme}
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-hover)";
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        title="Sign Out"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--danger-light)";
          e.currentTarget.style.color = "var(--danger)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        <LogOut size={16} />
      </button>
    </aside>
  );
}
