import { useState, useContext, useEffect } from "react";
import Avatar from "./Avatar.jsx";
import { UserContext } from "../context/UserContext";
import {
  X,
  Copy,
  Check,
  Eye,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Radio,
  ExternalLink,
  Lock,
} from "lucide-react";

// Key Overlay Modal
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
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          borderRadius: 12,
          padding: 24,
          width: "100%",
          maxWidth: 420,
          boxShadow: "var(--shadow-xl)",
          animation: "fadeIn 0.2s ease-out forwards",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            {platform} Webhook Secret / API Key
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-card-subtle)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div
          style={{
            background: "var(--warning-light)",
            border: "1px solid var(--warning-border)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 14,
            fontSize: 12,
            color: "var(--warning)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>Keep this token confidential. It authenticates webhook payloads.</span>
        </div>

        <div
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "12px 14px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: "var(--text-primary)",
            wordBreak: "break-all",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {apiKey || "••••••••••••••••••••••••••••••••"}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              background: copied ? "var(--success-light)" : "var(--primary)",
              border: copied ? "1px solid var(--success-border)" : "none",
              color: copied ? "var(--success)" : "#ffffff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Token"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePanel({ onClose }) {
  const [saved, setSaved] = useState(false);
  const { user } = useContext(UserContext);
  const hasPassword = Boolean(user?.password);

  const [providers, setProviders] = useState({});
  const [channel, setChannel] = useState("");
  const [token, setToken] = useState("");
  const [saveError, setSaveError] = useState(null);
  const [keyOverlay, setKeyOverlay] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSaved, setPwdSaved] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(`${window.__ENV__.VITE_API_URL}/auth/providers/${user._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setProviders(data.providers || {});
          setChannel(data.providers.slackChannel || "");
          setToken(data.providers.slackURL || "");
        }
      } catch (err) {
        console.error("Failed to fetch provider connections", err);
      }
    };
    if (user?._id) fetchProviders();
  }, [user]);

  const handleSaveSlack = async () => {
    setSaveError(null);
    const hasChannel = channel.trim() !== "";
    const hasToken = token.trim() !== "";
    if (hasChannel !== hasToken) {
      setSaveError("Both Slack Channel and Slack Token must be provided together, or both left empty.");
      return;
    }

    try {
      const res = await fetch(`${window.__ENV__.VITE_API_URL}/user/updateConfig/${user._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slackChannel: channel, slackToken: token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.message || "Failed to save Slack configuration.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Network error while saving settings.");
    }
  };

  const connectPlatform = (provider) => {
    window.location.href = `${window.__ENV__.VITE_API_URL}/auth/${provider}`;
  };

  const handleChangePassword = async () => {
    setPwdError(null);
    if (!newPwd || !confirmNewPwd) {
      setPwdError("All password fields are required.");
      return;
    }
    if (newPwd !== confirmNewPwd) {
      setPwdError("Passwords do not match.");
      return;
    }
    if (newPwd.length < 8 || !/[A-Z]/.test(newPwd) || !/[a-z]/.test(newPwd) || !/\d/.test(newPwd)) {
      setPwdError("Password must be ≥8 chars with uppercase, lowercase, and a number.");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch(`${window.__ENV__.VITE_API_URL}/user/updatePass/${user._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setPwdError(data.message || data.msg || "Failed to update password.");
        return;
      }
      setPwdSaved(true);
      setNewPwd("");
      setConfirmNewPwd("");
      setTimeout(() => setPwdSaved(false), 2500);
    } catch {
      setPwdError("Network error. Please try again.");
    } finally {
      setPwdLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    background: "var(--bg-input)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 10,
    color: "var(--text-primary)",
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
  };

  const platformItem = (name, connected, apiKey) => (
    <div
      key={name}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 14px",
        background: "var(--bg-card-subtle)",
        borderRadius: 10,
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{name}</div>

      {connected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--success)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Check size={14} /> Connected
          </span>
          <button
            onClick={() => setKeyOverlay({ platform: name, key: apiKey })}
            title="Inspect API Key"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
            }}
          >
            <Eye size={12} />
            <span>Key</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => connectPlatform(name.toLowerCase())}
          style={{
            background: "var(--primary)",
            border: "none",
            color: "#ffffff",
            fontSize: 12,
            padding: "5px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Connect
        </button>
      )}
    </div>
  );

  return (
    <>
      {keyOverlay && (
        <KeyOverlay
          platform={keyOverlay.platform}
          apiKey={keyOverlay.key}
          onClose={() => setKeyOverlay(null)}
        />
      )}

      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 80,
        }}
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-card)",
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-xl)",
          animation: "fadeIn 0.25s ease-out forwards",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Profile & Settings
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-card-subtle)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: "22px 24px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* User Information Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 16,
              background: "var(--bg-card-subtle)",
              borderRadius: 10,
            }}
          >
            <Avatar avatarURL={user?.avatarUrl} name={user?.name || user?.email} size={46} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Pipeline Developer"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Connected VCS Integrations */}
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 10 }}>
              Connected VCS Platforms
            </div>
            {platformItem("GitHub", providers?.github, providers?.githubkey)}
            {platformItem("GitLab", providers?.gitlab, providers?.gitlabkey)}
            {platformItem("Bitbucket", providers?.bitbucket, providers?.bitbucketkey)}
          </div>

          {/* Slack Configuration */}
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Radio size={13} color="var(--primary)" />
              Slack Notifications Config
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                Slack Channel Name
              </label>
              <input
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="#pipeline-alerts"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                  Slack Bot / Webhook Token
                </label>
                <a
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 2, textDecoration: "none" }}
                >
                  Need help? <ExternalLink size={10} />
                </a>
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="xoxb-..."
                style={inputStyle}
              />
            </div>

            {saveError && (
              <div style={{ padding: "9px 12px", borderRadius: 8, background: "var(--danger-light)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>
                {saveError}
              </div>
            )}

            <button
              onClick={handleSaveSlack}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                background: saved ? "var(--success-light)" : "var(--primary)",
                border: saved ? "1px solid var(--success-border)" : "none",
                color: saved ? "var(--success)" : "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saved ? <Check size={15} /> : null}
              <span>{saved ? "Configuration Saved" : "Save Slack Config"}</span>
            </button>
          </div>

          {/* Password Section */}
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Lock size={13} />
              {hasPassword ? "Change Password" : "Set Password"}
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                New Password
              </label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min 8 chars (uppercase + number)"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmNewPwd}
                onChange={(e) => setConfirmNewPwd(e.target.value)}
                placeholder="Repeat password"
                style={inputStyle}
              />
            </div>

            {pwdError && (
              <div style={{ padding: "9px 12px", borderRadius: 8, background: "var(--danger-light)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>
                {pwdError}
              </div>
            )}

            {pwdSaved && (
              <div style={{ padding: "9px 12px", borderRadius: 8, background: "var(--success-light)", border: "1px solid var(--success-border)", color: "var(--success)", fontSize: 12, marginBottom: 10 }}>
                Password successfully updated.
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwdLoading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                background: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontWeight: 700,
                fontSize: 13,
                cursor: pwdLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {pwdLoading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
              <span>{pwdLoading ? "Updating…" : hasPassword ? "Update Password" : "Set Password"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
