import { useState, useContext, useEffect } from "react";
import Avatar from "./Avatar.jsx";
import { UserContext } from "../context/UserContext";

// Key Overlay Component
function KeyOverlay({ platform, apiKey, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f1521",
          border: "1px solid #1e2330",
          borderRadius: 14,
          padding: 28,
          width: "90vw",        // 👈 force mobile-friendly width
          maxWidth: "380px",    // 👈 keep desktop limit
          marginLeft: "0px",    // 👈 remove side shifts
          marginRight: "0px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
            {platform} API Key
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#1e2330",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 16,
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Warning */}
        <div
          style={{
            background: "#1a1200",
            border: "1px solid #3d2e00",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 16,
            fontSize: 11,
            color: "#f59e0b",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span>⚠</span> Keep this key secret. Do not share it publicly.
        </div>

        {/* Key display */}
        <div
          style={{
            background: "#070a0f",
            border: "1px solid #1e2330",
            borderRadius: 8,
            padding: "12px 14px",
            fontFamily: "monospace",
            fontSize: 12,
            color: "#7dd3fc",
            wordBreak: "break-all",
            letterSpacing: "0.5px",
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          {apiKey || "••••••••••••••••••••••••••••••••"}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              background: copied ? "#10b98122" : "#3b82f6",
              border: copied ? "1px solid #10b981" : "1px solid transparent",
              color: copied ? "#10b981" : "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {copied ? "✓ Copied!" : "⎘ Copy Key"}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid #1e2330",
              color: "#64748b",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePanel({ onClose }) {
  const [saved, setSaved] = useState(false);
  const { user } = useContext(UserContext);

  const [providers, setProviders] = useState({});
  const [channel, setChannel] = useState(providers.slackChannel || "");
  const [token, setToken] = useState(providers.slackURL || "");
  const [saveError, setSaveError] = useState(null);
  const [keyOverlay, setKeyOverlay] = useState(null); // { platform, key }

  const handleSave = async () => {
    setSaveError(null);

    const hasChannel = channel.trim() !== "";
    const hasToken = token.trim() !== "";
    if (hasChannel !== hasToken) {
      setSaveError(
        "Both Slack Channel and Slack Token must be provided together, or both left empty.",
      );
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/updateConfig/${user._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slackChannel: channel, slackToken: token }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(
          data.message || "Failed to save configuration. Please try again.",
        );
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(
        "Network error. Please check your connection and try again.",
      );
    }
  };

  const connectPlatform = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
  };

  const handleShowKey = (name, key) => {
    setKeyOverlay({ platform: name, key });
  };

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/providers/${user._id}`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();

      if (data.success) {
        setProviders(data.providers);
        setChannel(data.providers.slackChannel || "");
        setToken(data.providers.slackURL || "");
      }
    };

    fetchProviders();
  }, []);

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    background: "#0a0d12",
    border: "1px solid #1e2330",
    borderRadius: 7,
    color: "#e2e8f0",
    fontSize: 13,
    fontFamily: "monospace",
    outline: "none",
  };

  const platformRow = (name, connected, apiKey) => (
    <div
      key={name}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        background: "#0a0d12",
        borderRadius: 8,
        border: "1px solid #1e2330",
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
        {name}
      </div>

      {connected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#10b981", fontSize: 12 }}>✓ Connected</span>
          <button
            onClick={() => handleShowKey(name, apiKey)}
            title="View API Key"
            style={{
              background: "#1e2330",
              border: "1px solid #2d3748",
              color: "#94a3b8",
              fontSize: 12,
              padding: "5px 10px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 600,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2d3748")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1e2330")}
          >
            {/* Eye icon SVG */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            See Key
          </button>
        </div>
      ) : (
        <button
          onClick={() => connectPlatform(name.toLowerCase())}
          style={{
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Connect
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Key Overlay */}
      {keyOverlay && (
        <KeyOverlay
          platform={keyOverlay.platform}
          apiKey={keyOverlay.key}
          onClose={() => setKeyOverlay(null)}
        />
      )}

      <div style={{ height: "100%", display: "flex", flexDirection: "column", marginLeft: "50px", marginRight: "-50px" }}>
        <div
          style={{
            padding: "20px 20px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: "0.5px",
            }}
          >
            Profile & Settings
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
          {/* User card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
              padding: 16,
              background: "#0a0d12",
              borderRadius: 10,
              border: "1px solid #1e2330",
            }}
          >
            <Avatar avatarURL={user.avatarUrl} color="#3b82f6" size={44} />

            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{user.email}</div>
            </div>
          </div>

          {/* Platform connections */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Connected Platforms
            </div>

            {platformRow("GitHub", providers?.github, providers?.githubkey)}
            {platformRow("GitLab", providers?.gitlab, providers?.gitlabkey)}
            {platformRow(
              "Bitbucket",
              providers?.bitbucket,
              providers?.bitbucketkey,
            )}
          </div>

          {/* Slack config */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 700,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ color: "#36c5f0" }}>⬡</span> Slack Configuration
            </div>

            <label
              style={{
                fontSize: 12,
                color: "#475569",
                display: "block",
                marginBottom: 5,
              }}
            >
              Channel Name
            </label>

            <input
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="#your-channel"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label
              style={{
                fontSize: 12,
                color: "#475569",
                display: "block",
                marginBottom: 5,
              }}
            >
              Slack Token{" "}
              <a
                target="_blank"
                href="https://api.slack.com/apps"
                style={{ color: "blue" }}
              >
                need help?
              </a>
            </label>

            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="xoxb-..."
              style={inputStyle}
            />
            {!channel.trim() && !token.trim() && (
              <div
                style={{
                  fontSize: 11,
                  color: "#f59e0b",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>⚠</span> You will not be notified on any Slack channel.
              </div>
            )}
            <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>
              Notifications will be sent to your configured Slack channel only.
            </div>
          </div>
          {saveError && (
            <div
              style={{
                background: "#1a0a0a",
                border: "1px solid #7f1d1d",
                borderRadius: 8,
                padding: "9px 12px",
                marginBottom: 12,
                fontSize: 12,
                color: "#f87171",
                display: "flex",
                gap: 6,
                alignItems: "flex-start",
              }}
            >
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{saveError}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 8,
              background: saved ? "#10b98122" : "#3b82f6",
              border: saved ? "1px solid #10b981" : "none",
              color: saved ? "#10b981" : "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {saved ? "✓ Saved" : "Save Configuration"}
          </button>
        </div>
      </div>
    </>
  );
}
