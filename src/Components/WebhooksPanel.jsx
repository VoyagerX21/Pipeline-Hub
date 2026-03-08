import { useState } from "react";
import Badge from "./Badge.jsx";
import { EVENT_COLORS, timeAgo } from "../constants.jsx";

const MOCK_WEBHOOKS = [
  { id: "wh_1", name: "Slack Notifier", url: "https://hooks.slack.com/services/T00/B00/xxx", events: ["push", "merge"], status: "active", deliveries: 47, lastDelivery: new Date(Date.now() - 2 * 60000) },
  { id: "wh_2", name: "CI Trigger", url: "https://ci.internal.io/webhook/trigger", events: ["push", "pull_request"], status: "active", deliveries: 31, lastDelivery: new Date(Date.now() - 35 * 60000) },
  { id: "wh_3", name: "Audit Logger", url: "https://audit.company.com/vcs/events", events: ["push", "pull_request", "merge", "pull"], status: "inactive", deliveries: 12, lastDelivery: new Date(Date.now() - 5 * 3600000) },
];

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px",
  background: "#080b10", border: "1px solid #1e2330", borderRadius: 7,
  color: "#e2e8f0", fontSize: 13, fontFamily: "monospace", outline: "none",
  marginBottom: 10, transition: "border-color 0.15s",
};

export default function WebhooksPanel() {
  const [webhooks, setWebhooks] = useState(MOCK_WEBHOOKS);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const toggleStatus = (id) => {
    setWebhooks(ws => ws.map(w => w.id === id ? { ...w, status: w.status === "active" ? "inactive" : "active" } : w));
  };

  const handleCreate = () => {
    if (!newName || !newUrl) return;
    setWebhooks(ws => [...ws, {
      id: `wh_${Date.now()}`, name: newName, url: newUrl,
      events: ["push"], status: "active", deliveries: 0, lastDelivery: new Date()
    }]);
    setNewName(""); setNewUrl(""); setShowAdd(false);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Webhooks</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
            {webhooks.filter(w => w.status === "active").length} active endpoints
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: "8px 14px", borderRadius: 7,
            background: showAdd ? "#1e2330" : "#3b82f6",
            border: "none", color: showAdd ? "#94a3b8" : "#fff",
            fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s"
          }}
        >
          {showAdd ? "Cancel" : "+ Add Webhook"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: "#0a0d12", border: "1px solid #3b82f640", borderRadius: 10, padding: 18, marginBottom: 20, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 14 }}>
            New Webhook
          </div>

          <label style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 5 }}>Name</label>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="My Webhook" style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#1e2330"}
          />

          <label style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 5 }}>Endpoint URL</label>
          <input
            value={newUrl} onChange={e => setNewUrl(e.target.value)}
            placeholder="https://..." style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#1e2330"}
          />

          <button
            onClick={handleCreate}
            style={{ padding: "9px 18px", borderRadius: 7, background: "#3b82f6", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Create Webhook
          </button>
        </div>
      )}

      {/* Webhook list */}
      <div style={{ marginTop: showAdd ? 0 : 20 }}>
        {webhooks.map(wh => (
          <div key={wh.id} style={{
            background: "#0a0d12", border: `1px solid ${wh.status === "active" ? "#1e2330" : "#1a1a1a"}`,
            borderRadius: 10, padding: 18, marginBottom: 12,
            opacity: wh.status === "inactive" ? 0.65 : 1, transition: "all 0.2s"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: wh.status === "active" ? "#10b981" : "#334155",
                  boxShadow: wh.status === "active" ? "0 0 6px #10b98188" : "none"
                }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{wh.name}</div>
              </div>
              <button
                onClick={() => toggleStatus(wh.id)}
                style={{
                  padding: "4px 10px", borderRadius: 5,
                  background: wh.status === "active" ? "#33415522" : "#3b82f622",
                  border: `1px solid ${wh.status === "active" ? "#334155" : "#3b82f640"}`,
                  color: wh.status === "active" ? "#64748b" : "#3b82f6",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.5px"
                }}
              >
                {wh.status === "active" ? "Disable" : "Enable"}
              </button>
            </div>

            <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {wh.url}
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {wh.events.map(ev => (
                <Badge key={ev} label={ev.replace("_", " ")} color={EVENT_COLORS[ev]} />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #1e2330" }}>
              <span style={{ fontSize: 11, color: "#475569" }}>
                <span style={{ color: "#64748b", fontFamily: "monospace" }}>{wh.deliveries}</span> deliveries
              </span>
              <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
                Last: {timeAgo(wh.lastDelivery)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}