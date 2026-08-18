import { useState } from "react";
import EventRow from "./EventRow.jsx";
import { Search, Filter, Inbox } from "lucide-react";

export default function EventsPanel({ events = [], selectedEvent, setSelectedEvent }) {
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterRepo, setFilterRepo] = useState("");

  const getPlatform = (e) => e.provider || e.platform || "";
  const getType = (e) => e.type || e.eventType || "";
  const getRepoName = (e) => e.repositoryId?.name || e.repository?.name || e.repo || "";
  const getEventId = (e) => e._id || e.id;

  const filtered = events.filter((e) =>
    (filterPlatform === "all" || getPlatform(e) === filterPlatform) &&
    (filterType === "all" || getType(e) === filterType) &&
    (!filterRepo || getRepoName(e).toLowerCase().includes(filterRepo.toLowerCase()))
  );

  const selectStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-base)",
    borderRadius: 8,
    color: "var(--text-primary)",
    fontSize: 12,
    padding: "7px 10px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg-canvas)" }}>
      {/* Filter toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 18px",
          borderBottom: "1px solid var(--border-base)",
          background: "var(--bg-canvas)",
          flexWrap: "wrap",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Platforms</option>
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Event Types</option>
          <option value="push">Push</option>
          <option value="pull_request">Pull Request</option>
          <option value="merge">Merge</option>
          <option value="pull">Pull</option>
        </select>

        <div style={{ position: "relative", flex: 1, minWidth: 150 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={filterRepo}
            onChange={(e) => setFilterRepo(e.target.value)}
            placeholder="Search by repo or branch..."
            style={{
              ...selectStyle,
              width: "100%",
              paddingLeft: 30,
            }}
          />
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono', monospace",
            marginLeft: "auto",
            background: "var(--bg-card-subtle)",
            border: "1px solid var(--border-base)",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          {filtered.length} / {events.length}
        </span>
      </div>

      {/* Scrollable Event List */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 240,
              color: "var(--text-muted)",
              fontSize: 13,
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--bg-card-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-base)",
              }}
            >
              <Inbox size={20} color="var(--text-muted)" />
            </div>
            <div>No matching events found</div>
          </div>
        ) : (
          filtered.map((event, idx) => (
            <EventRow
              key={event._id || event.id || `${getPlatform(event)}-${getType(event)}-${getRepoName(event)}-${idx}`}
              event={event}
              onClick={setSelectedEvent}
              selected={getEventId(selectedEvent || {}) === getEventId(event)}
            />
          ))
        )}
      </div>
    </div>
  );
}