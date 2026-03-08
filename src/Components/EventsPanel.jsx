import { useState } from "react";
import EventRow from "./EventRow.jsx";

const selectStyle = {
  background: "#0a0d12",
  border: "1px solid #1e2330",
  borderRadius: 6,
  color: "#94a3b8",
  fontSize: 12,
  padding: "6px 10px",
  outline: "none",
  cursor: "pointer",
  fontFamily: "monospace",
};

export default function EventsPanel({
  events,
  selectedEvent,
  setSelectedEvent
}) {

  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterRepo, setFilterRepo] = useState("");

  const getPlatform = (e) => e.provider || e.platform || "";
  const getType = (e) => e.type || e.eventType || "";
  const getRepoName = (e) => e.repositoryId?.name || e.repository?.name || e.repo || "";
  const getEventId = (e) => e._id || e.id;
  
  const filtered = events.filter(e =>
    (filterPlatform === "all" || getPlatform(e) === filterPlatform) &&
    (filterType === "all" || getType(e) === filterType) &&
    (!filterRepo ||
      getRepoName(e).toLowerCase().includes(filterRepo.toLowerCase()))
  );

  // console.log(filtered);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid #1e2330",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Platforms</option>
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Types</option>
          <option value="push">Push</option>
          <option value="pull_request">Pull Request</option>
          <option value="merge">Merge</option>
        </select>

        <input
          value={filterRepo}
          onChange={e => setFilterRepo(e.target.value)}
          placeholder="Filter by repo..."
          style={{
            ...selectStyle,
            flex: 1,
            minWidth: 120,
            color: filterRepo ? "#e2e8f0" : "#475569",
          }}
        />

        <span
          style={{
            fontSize: 11,
            color: "#334155",
            fontFamily: "monospace",
            marginLeft: "auto",
          }}
        >
          {filtered.length}/{events.length}
        </span>
      </div>

      {/* Event list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              color: "#334155",
              fontSize: 13,
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 28 }}>◈</div>
            <div>No events match the filters</div>
          </div>
        ) : (
          filtered.map(event => (
            <EventRow
              key={event._id || event.id || `${getPlatform(event)}-${getType(event)}-${getRepoName(event)}-${event.eventTimestamp || event.ts || "na"}`}
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