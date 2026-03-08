import { useState } from "react";
import Avatar from "./Avatar.jsx";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function ProfilePanel({ onClose }) {
  const [saved, setSaved] = useState(false);
  const { user } = useContext(UserContext);
  const [channel, setChannel] = useState(user.slackChannel);
  const [token, setToken] = useState(user.slackToken);

  const handleSave = () => {
    onSave({ slackChannel: channel, slackToken: token });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 12px",
    background: "#0a0d12", border: "1px solid #1e2330", borderRadius: 7,
    color: "#e2e8f0", fontSize: 13, fontFamily: "monospace", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.5px" }}>Profile & Settings</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 20 }}>×</button>
      </div>

      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        {/* User card */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: 16, background: "#0a0d12", borderRadius: 10, border: "1px solid #1e2330" }}>
          <Avatar avatarURL={user.avatarUrl} color="#3b82f6" size={44} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}><a target="_blank" style={{ textDecoration: "none", color: "#f1f5f9" }} href={user.profileUrl}>{user.username}</a></div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{user.email}</div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>{user.provider.toUpperCase()}</div>
          </div>
        </div>

        {/* Slack config */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#36c5f0" }}>⬡</span> Slack Configuration
          </div>

          <label style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 5 }}>Channel Name</label>
          <input
            value={channel}
            onChange={e => setChannel(e.target.value)}
            placeholder="#your-channel"
            style={{ ...inputStyle, marginBottom: 12 }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#1e2330"}
          />

          <label style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 5 }}>Slack Token <a target="_blank" href="https://api.slack.com/apps" style={{ color: "blue" }} >need help?</a></label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="xoxb-..."
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#1e2330"}
          />
          <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>
            Notifications will be sent to your configured Slack channel only.
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: "100%", padding: "11px", borderRadius: 8,
            background: saved ? "#10b98122" : "#3b82f6",
            border: saved ? "1px solid #10b981" : "none",
            color: saved ? "#10b981" : "#fff",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            transition: "all 0.2s", letterSpacing: "0.3px"
          }}
        >
          {saved ? "✓ Saved" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}